import { usePodcastPlayerController } from "./hooks/usePodcastPlayerController"
import { PodcastPlayerContext } from "./PodcastPlayerContext"

export function PodcastPlayerProvider({ children }) {
  const { audioRef, value } = usePodcastPlayerController()

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" playsInline style={{ display: "none" }} />
    </PodcastPlayerContext.Provider>
  )
}
