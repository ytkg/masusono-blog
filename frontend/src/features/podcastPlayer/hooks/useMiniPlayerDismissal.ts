import { useCallback, useEffect, useState } from "react"

interface UseMiniPlayerDismissalParams {
  hasCurrentEpisode: boolean
  isPlaying: boolean
  pause: () => void
}

export function useMiniPlayerDismissal({ hasCurrentEpisode, isPlaying, pause }: UseMiniPlayerDismissalParams) {
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
