import { createContext, useContext } from "react"
import { usePodcastPlayerController } from "./hooks/usePodcastPlayerController"

const PodcastPlayerContext = createContext(null)

export function PodcastPlayerProvider({ children }) {
  const { audioRef, value } = usePodcastPlayerController()

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
