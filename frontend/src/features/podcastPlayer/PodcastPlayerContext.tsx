import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { PodcastEpisode } from "@/types/podcast"

type PodcastPlayerStatus = "idle" | "loading" | "ready" | "error"

interface PodcastPlayerContextValue {
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

const PodcastPlayerContext = createContext<PodcastPlayerContextValue | null>(null)

interface PodcastPlayerProviderProps {
  children: ReactNode
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

export function PodcastPlayerProvider({ children }: PodcastPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState<PodcastPlayerStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [visibleEpisodeIds, setVisibleEpisodeIds] = useState<Set<string>>(() => new Set())

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
      setIsPlaying(true)
      setStatus("ready")
      setError(null)
    }
    const handlePause = () => {
      setIsPlaying(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleWaiting = () => {
      setStatus("loading")
    }
    const handleCanPlay = () => {
      setStatus("ready")
    }
    const handleError = () => {
      setIsPlaying(false)
      setStatus("error")
      setError(formatAudioError(audio))
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
        setStatus("loading")
        setError(null)
        audio.src = episode.audioUrl
        audio.currentTime = 0
      }

      try {
        await audio.play()
      } catch (err) {
        setStatus("error")
        setIsPlaying(false)
        setError(err instanceof Error ? err.message : "再生を開始できませんでした。")
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
        setStatus("error")
        setIsPlaying(false)
        setError(err instanceof Error ? err.message : "再生を開始できませんでした。")
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
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setStatus("idle")
    setError(null)
    setVisibleEpisodeIds(new Set())
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

  const value = useMemo<PodcastPlayerContextValue>(
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

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" playsInline style={{ display: "none" }} />
    </PodcastPlayerContext.Provider>
  )
}

export function usePodcastPlayer() {
  const context = useContext(PodcastPlayerContext)
  if (!context) {
    throw new Error("usePodcastPlayer must be used within PodcastPlayerProvider")
  }
  return context
}
