import { PodcastPlayerProvider } from "@/features/podcastPlayer/PodcastPlayerContext"
import AppLayout from "./AppLayout"

export default function App() {
  return (
    <PodcastPlayerProvider>
      <AppLayout />
    </PodcastPlayerProvider>
  )
}
