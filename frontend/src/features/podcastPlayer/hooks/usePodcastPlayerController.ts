import { useCallback, useMemo, useReducer, useRef, useState } from "react"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { usePodcastPlayerAudioEvents } from "@/features/podcastPlayer/hooks/usePodcastPlayerAudioEvents"
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
  visibleEpisodeId: string | null
  playEpisode: (episode: PodcastEpisode) => Promise<void>
  togglePlayPause: () => Promise<void>
  pause: () => void
  seekTo: (seconds: number) => void
  seekBy: (deltaSeconds: number) => void
  stop: () => void
  setEpisodeVisibility: (episodeId: string, visible: boolean) => void
}

export function usePodcastPlayerController() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playerState, dispatch] = useReducer(podcastPlayerReducer, initialPodcastPlayerState)
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [visibleEpisodeId, setVisibleEpisodeId] = useState<string | null>(null)
  const { isPlaying, status, error } = playerState

  const handleLoadedMetadata = useCallback((nextDuration: number) => {
    setDuration(nextDuration)
  }, [])

  const handleTimeUpdate = useCallback((nextCurrentTime: number) => {
    setCurrentTime(nextCurrentTime)
  }, [])

  const handlePlay = useCallback(() => {
    dispatch({ type: "PLAY_STARTED" })
  }, [])

  const handlePause = useCallback(() => {
    dispatch({ type: "PLAY_PAUSED" })
  }, [])

  const handleEnded = useCallback((endedAt: number) => {
    dispatch({ type: "PLAY_ENDED" })
    setCurrentTime(endedAt)
  }, [])

  const handleWaiting = useCallback(() => {
    dispatch({ type: "BUFFERING_STARTED" })
  }, [])

  const handleCanPlay = useCallback(() => {
    dispatch({ type: "CAN_PLAY" })
  }, [])

  const handleError = useCallback((message: string) => {
    dispatch({ type: "AUDIO_ERROR", error: message })
  }, [])

  usePodcastPlayerAudioEvents({
    audioRef,
    onLoadedMetadata: handleLoadedMetadata,
    onTimeUpdate: handleTimeUpdate,
    onPlay: handlePlay,
    onPause: handlePause,
    onEnded: handleEnded,
    onWaiting: handleWaiting,
    onCanPlay: handleCanPlay,
    onError: handleError,
  })

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

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
  }, [])

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
    setVisibleEpisodeId(null)
    dispatch({ type: "STOPPED" })
  }, [])

  const setEpisodeVisibility = useCallback((episodeId: string, visible: boolean) => {
    if (!episodeId) return

    setVisibleEpisodeId((prev) => {
      if (visible) {
        return prev === episodeId ? prev : episodeId
      }
      return prev === episodeId ? null : prev
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
      visibleEpisodeId,
      playEpisode,
      togglePlayPause,
      pause,
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
      visibleEpisodeId,
      playEpisode,
      togglePlayPause,
      pause,
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
