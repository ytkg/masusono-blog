import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const SEEK_PREVIEW_INTERVAL_MS = 150
const SEEK_PREVIEW_HOLD_MS = 250
const SEEK_SYNC_EPSILON_SECONDS = 0.01

function isSameSeekPoint(a, b) {
  return Math.abs(a - b) <= SEEK_SYNC_EPSILON_SECONDS
}

export function useSeekSliderState({ canSeek, currentTime, duration, onSeekTo }) {
  const [seekPreviewTime, setSeekPreviewTime] = useState(null)
  const previewTimeoutRef = useRef(null)
  const previewHoldTimeoutRef = useRef(null)
  const queuedPreviewTimeRef = useRef(null)
  const lastPreviewDispatchedAtRef = useRef(0)
  const lastPreviewSeekedTimeRef = useRef(null)

  const displayedCurrentTime = seekPreviewTime ?? currentTime
  const sliderValue = useMemo(() => Math.min(displayedCurrentTime, duration || 0), [displayedCurrentTime, duration])

  const clearScheduledPreview = useCallback(() => {
    if (previewTimeoutRef.current != null) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }

    queuedPreviewTimeRef.current = null
  }, [])

  const clearPreviewHold = useCallback(() => {
    if (previewHoldTimeoutRef.current != null) {
      clearTimeout(previewHoldTimeoutRef.current)
      previewHoldTimeoutRef.current = null
    }
  }, [])

  const schedulePreviewHoldRelease = useCallback(() => {
    clearPreviewHold()
    previewHoldTimeoutRef.current = setTimeout(() => {
      previewHoldTimeoutRef.current = null
      setSeekPreviewTime(null)
    }, SEEK_PREVIEW_HOLD_MS)
  }, [clearPreviewHold])

  const dispatchPreviewSeek = useCallback(
    (value) => {
      if (lastPreviewSeekedTimeRef.current != null && isSameSeekPoint(lastPreviewSeekedTimeRef.current, value)) return

      lastPreviewSeekedTimeRef.current = value
      lastPreviewDispatchedAtRef.current = Date.now()
      onSeekTo(value)
    },
    [onSeekTo],
  )

  useEffect(() => {
    if (!canSeek) {
      clearScheduledPreview()
      clearPreviewHold()
      setSeekPreviewTime(null)
      lastPreviewDispatchedAtRef.current = 0
      lastPreviewSeekedTimeRef.current = null
    }
  }, [canSeek, clearPreviewHold, clearScheduledPreview])

  useEffect(
    () => () => {
      clearScheduledPreview()
      clearPreviewHold()
    },
    [clearPreviewHold, clearScheduledPreview],
  )

  const handleSeekChange = useCallback(
    (value) => {
      setSeekPreviewTime((prev) => (prev === value ? prev : value))
      schedulePreviewHoldRelease()

      if (!canSeek) return

      const elapsed = Date.now() - lastPreviewDispatchedAtRef.current
      if (lastPreviewDispatchedAtRef.current === 0 || elapsed >= SEEK_PREVIEW_INTERVAL_MS) {
        clearScheduledPreview()
        dispatchPreviewSeek(value)
        return
      }

      queuedPreviewTimeRef.current = value
      if (previewTimeoutRef.current != null) return

      previewTimeoutRef.current = setTimeout(() => {
        previewTimeoutRef.current = null
        const queuedPreviewTime = queuedPreviewTimeRef.current
        queuedPreviewTimeRef.current = null
        if (queuedPreviewTime == null) return
        dispatchPreviewSeek(queuedPreviewTime)
      }, SEEK_PREVIEW_INTERVAL_MS - elapsed)
    },
    [canSeek, clearScheduledPreview, dispatchPreviewSeek, schedulePreviewHoldRelease],
  )

  const handleSeekCommit = useCallback(
    (value) => {
      const commitTime = seekPreviewTime == null ? Math.max(value, currentTime) : value

      if (canSeek) {
        clearScheduledPreview()
        clearPreviewHold()
        lastPreviewDispatchedAtRef.current = 0
        lastPreviewSeekedTimeRef.current = commitTime
        onSeekTo(commitTime)
      }

      setSeekPreviewTime(null)
    },
    [canSeek, clearPreviewHold, clearScheduledPreview, currentTime, onSeekTo, seekPreviewTime],
  )

  return {
    displayedCurrentTime,
    sliderValue,
    handleSeekChange,
    handleSeekCommit,
  }
}
