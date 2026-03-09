import { useContext } from "react"
import { PodcastPlayerContext } from "./PodcastPlayerContext"

export function usePodcastPlayer() {
  const context = useContext(PodcastPlayerContext)
  if (!context) {
    throw new Error("usePodcastPlayer must be used within PodcastPlayerProvider")
  }

  return context
}
