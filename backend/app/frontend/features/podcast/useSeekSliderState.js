import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const SEEK_SYNC_EPSILON_SECONDS = 0.01

function isSameSeekPoint(a, b) {
  return Math.abs(a - b) <= SEEK_SYNC_EPSILON_SECONDS
}

export function useSeekSliderState({ canSeek, currentTime, duration, onSeekTo }) {
  const [seekPreviewTime, setSeekPreviewTime] = useState(null)
  const lastSeekedTimeRef = useRef(null)

  const displayedCurrentTime = seekPreviewTime ?? currentTime
  const sliderValue = useMemo(() => Math.min(displayedCurrentTime, duration || 0), [displayedCurrentTime, duration])

  useEffect(() => {
    if (!canSeek) {
      setSeekPreviewTime(null)
      lastSeekedTimeRef.current = null
    }
  }, [canSeek])

  const syncSeekTo = useCallback(
    (value) => {
      if (!canSeek) return
      if (lastSeekedTimeRef.current != null && isSameSeekPoint(lastSeekedTimeRef.current, value)) return
      lastSeekedTimeRef.current = value
      onSeekTo(value)
    },
    [canSeek, onSeekTo],
  )

  const handleSeekChange = useCallback(
    (value) => {
      setSeekPreviewTime((prev) => (prev === value ? prev : value))
      syncSeekTo(value)
    },
    [syncSeekTo],
  )

  const handleSeekCommit = useCallback(() => {
    setSeekPreviewTime(null)
  }, [])

  return {
    displayedCurrentTime,
    sliderValue,
    handleSeekChange,
    handleSeekCommit,
  }
}
