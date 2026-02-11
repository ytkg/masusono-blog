import { useCallback, useMemo, useReducer, useRef, useState } from "react"
import { usePodcastPlayerAudioEvents } from "./usePodcastPlayerAudioEvents"
import { initialPodcastPlayerState, podcastPlayerReducer } from "../model/podcastPlayerState"

export function usePodcastPlayerController() {
  const audioRef = useRef(null)
  const [playerState, dispatch] = useReducer(podcastPlayerReducer, initialPodcastPlayerState)
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const { isPlaying, status, error } = playerState

  const handleLoadedMetadata = useCallback((nextDuration) => {
    setDuration(nextDuration)
  }, [])

  const handleTimeUpdate = useCallback((nextCurrentTime) => {
    setCurrentTime(nextCurrentTime)
  }, [])

  const handlePlay = useCallback(() => {
    dispatch({ type: "PLAY_STARTED" })
  }, [])

  const handlePause = useCallback(() => {
    dispatch({ type: "PLAY_PAUSED" })
  }, [])

  const handleEnded = useCallback((endedAt) => {
    dispatch({ type: "PLAY_ENDED" })
    setCurrentTime(endedAt)
  }, [])

  const handleWaiting = useCallback(() => {
    dispatch({ type: "BUFFERING_STARTED" })
  }, [])

  const handleCanPlay = useCallback(() => {
    dispatch({ type: "CAN_PLAY" })
  }, [])

  const handleError = useCallback((message) => {
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
    async (episode) => {
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
    (seconds) => {
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
    (deltaSeconds) => {
      const audio = audioRef.current
      if (!audio || !currentEpisode) return
      seekTo((audio.currentTime || 0) + deltaSeconds)
    },
    [currentEpisode, seekTo],
  )

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    setCurrentTime(audio.currentTime || 0)
    dispatch({ type: "PLAY_PAUSED" })
  }, [])

  const value = useMemo(
    () => ({
      currentEpisode,
      isPlaying,
      currentTime,
      duration,
      status,
      error,
      playEpisode,
      togglePlayPause,
      pause,
      seekTo,
      seekBy,
      stop,
    }),
    [
      currentEpisode,
      isPlaying,
      currentTime,
      duration,
      status,
      error,
      playEpisode,
      togglePlayPause,
      pause,
      seekTo,
      seekBy,
      stop,
    ],
  )

  return {
    audioRef,
    value,
  }
}
