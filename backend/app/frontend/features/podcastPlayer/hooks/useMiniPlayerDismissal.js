import { useCallback, useEffect, useState } from "react"

export function useMiniPlayerDismissal({ hasCurrentEpisode, isPlaying, pause }) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!hasCurrentEpisode) {
      setIsDismissed(false)
    }
  }, [hasCurrentEpisode])

  useEffect(() => {
    if (isPlaying) {
      setIsDismissed(false)
    }
  }, [isPlaying])

  const dismiss = useCallback(() => {
    pause()
    setIsDismissed(true)
  }, [pause])

  return {
    isDismissed,
    dismiss,
  }
}
