import { createContext, useContext, type ReactNode } from "react"
import {
  usePodcastPlayerController,
  type PodcastPlayerControllerValue,
} from "@/features/podcastPlayer/hooks/usePodcastPlayerController"

const PodcastPlayerContext = createContext<PodcastPlayerControllerValue | null>(null)

interface PodcastPlayerProviderProps {
  children: ReactNode
}

export function PodcastPlayerProvider({ children }: PodcastPlayerProviderProps) {
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
