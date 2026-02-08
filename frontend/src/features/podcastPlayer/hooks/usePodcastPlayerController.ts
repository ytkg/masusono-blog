import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import {
  initialPodcastPlayerState,
  podcastPlayerReducer,
  type PodcastPlayerStatus,
} from "@/features/podcastPlayer/model/podcastPlayerState"

export interface PodcastPlayerControllerValue {
  currentEpisode: PodcastEpisode | null
  isPlaying: boolean
  currentTime: number
  duration: number
  status: PodcastPlayerStatus
  error: string | null
  visibleEpisodeIds: ReadonlySet<string>
  playEpisode: (episode: PodcastEpisode) => Promise<void>
  togglePlayPause: () => Promise<void>
  seekTo: (seconds: number) => void
  seekBy: (deltaSeconds: number) => void
  stop: () => void
  setEpisodeVisibility: (episodeId: string, visible: boolean) => void
}

function formatAudioError(audio: HTMLAudioElement) {
  const mediaError = audio.error
  if (!mediaError) return "音声の読み込みに失敗しました。"

  switch (mediaError.code) {
    case mediaError.MEDIA_ERR_ABORTED:
      return "音声の読み込みが中断されました。"
    case mediaError.MEDIA_ERR_NETWORK:
      return "ネットワークエラーで音声を取得できませんでした。"
    case mediaError.MEDIA_ERR_DECODE:
      return "音声データの再生に失敗しました。"
    case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "この音声フォーマットは再生できません。"
    default:
      return "音声の読み込みに失敗しました。"
  }
}

export function usePodcastPlayerController() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playerState, dispatch] = useReducer(podcastPlayerReducer, initialPodcastPlayerState)
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [visibleEpisodeIds, setVisibleEpisodeIds] = useState<Set<string>>(() => new Set())
  const { isPlaying, status, error } = playerState

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }
    const handlePlay = () => {
      dispatch({ type: "PLAY_STARTED" })
    }
    const handlePause = () => {
      dispatch({ type: "PLAY_PAUSED" })
    }
    const handleEnded = () => {
      dispatch({ type: "PLAY_ENDED" })
      setCurrentTime(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleWaiting = () => {
      dispatch({ type: "BUFFERING_STARTED" })
    }
    const handleCanPlay = () => {
      dispatch({ type: "CAN_PLAY" })
    }
    const handleError = () => {
      dispatch({ type: "AUDIO_ERROR", error: formatAudioError(audio) })
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
    }
  }, [])

  const playEpisode = useCallback(
    async (episode: PodcastEpisode) => {
      const audio = audioRef.current
      if (!audio) return

      const isSameEpisode = currentEpisode?.id === episode.id
      if (!isSameEpisode) {
        setCurrentEpisode(episode)
        setCurrentTime(0)
        setDuration(0)
        dispatch({ type: "PLAY_REQUESTED" })
        audio.src = episode.audioUrl
        audio.currentTime = 0
      }

      try {
        await audio.play()
      } catch (err) {
        dispatch({
          type: "PLAY_FAILED",
          error: err instanceof Error ? err.message : "再生を開始できませんでした。",
        })
      }
    },
    [currentEpisode?.id],
  )

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !currentEpisode) return

    if (audio.paused) {
      try {
        await audio.play()
      } catch (err) {
        dispatch({
          type: "PLAY_FAILED",
          error: err instanceof Error ? err.message : "再生を開始できませんでした。",
        })
      }
      return
    }

    audio.pause()
  }, [currentEpisode])

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current
      if (!audio || !currentEpisode) return

      const max = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration
      const clamped = Math.max(0, Math.min(seconds, max || 0))
      audio.currentTime = clamped
      setCurrentTime(audio.currentTime || 0)
    },
    [currentEpisode, duration],
  )

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current
      if (!audio || !currentEpisode) return
      seekTo((audio.currentTime || 0) + deltaSeconds)
    },
    [currentEpisode, seekTo],
  )

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
    }
    setCurrentEpisode(null)
    setCurrentTime(0)
    setDuration(0)
    setVisibleEpisodeIds(new Set())
    dispatch({ type: "STOPPED" })
  }, [])

  const setEpisodeVisibility = useCallback((episodeId: string, visible: boolean) => {
    if (!episodeId) return

    setVisibleEpisodeIds((prev) => {
      const alreadyVisible = prev.has(episodeId)
      if ((visible && alreadyVisible) || (!visible && !alreadyVisible)) return prev

      const next = new Set(prev)
      if (visible) {
        next.add(episodeId)
      } else {
        next.delete(episodeId)
      }
      return next
    })
  }, [])

  const value = useMemo<PodcastPlayerControllerValue>(
    () => ({
      currentEpisode,
      isPlaying,
      currentTime,
      duration,
      status,
      error,
      visibleEpisodeIds,
      playEpisode,
      togglePlayPause,
      seekTo,
      seekBy,
      stop,
      setEpisodeVisibility,
    }),
    [
      currentEpisode,
      isPlaying,
      currentTime,
      duration,
      status,
      error,
      visibleEpisodeIds,
      playEpisode,
      togglePlayPause,
      seekTo,
      seekBy,
      stop,
      setEpisodeVisibility,
    ],
  )

  return {
    audioRef,
    value,
  }
}
