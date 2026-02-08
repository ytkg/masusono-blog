import { useEffect, type RefObject } from "react"
import { formatAudioError } from "@/features/podcastPlayer/lib/formatAudioError"

interface UsePodcastPlayerAudioEventsParams {
  audioRef: RefObject<HTMLAudioElement | null>
  onLoadedMetadata: (duration: number) => void
  onTimeUpdate: (currentTime: number) => void
  onPlay: () => void
  onPause: () => void
  onEnded: (currentTime: number) => void
  onWaiting: () => void
  onCanPlay: () => void
  onError: (message: string) => void
}

export function usePodcastPlayerAudioEvents({
  audioRef,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onWaiting,
  onCanPlay,
  onError,
}: UsePodcastPlayerAudioEventsParams) {
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      onLoadedMetadata(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleTimeUpdate = () => {
      onTimeUpdate(audio.currentTime || 0)
    }
    const handlePlay = () => {
      onPlay()
    }
    const handlePause = () => {
      onPause()
    }
    const handleEnded = () => {
      onEnded(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleWaiting = () => {
      onWaiting()
    }
    const handleCanPlay = () => {
      onCanPlay()
    }
    const handleError = () => {
      onError(formatAudioError(audio))
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
  }, [audioRef, onLoadedMetadata, onTimeUpdate, onPlay, onPause, onEnded, onWaiting, onCanPlay, onError])
}
