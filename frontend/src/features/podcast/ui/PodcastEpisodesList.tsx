import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Alert from "@mui/material/Alert"
import { usePodcasts } from "@/features/podcast/hooks/usePodcasts"
import ContentCardSkeleton from "@/shared/ui/ContentCardSkeleton"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

const SKELETON_COUNT = 3
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `podcast-skeleton-${index}`)

export default function PodcastEpisodesList() {
  const { data: episodes, isLoading, error } = usePodcasts()

  if (isLoading && !episodes) {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        {SKELETON_KEYS.map((key) => (
          <ContentCardSkeleton key={key} />
        ))}
      </Box>
    )
  }

  if (error && !episodes) {
    return <Alert severity="error">エピソードの取得に失敗しました: {String((error as Error)?.message ?? error)}</Alert>
  }

  if (!episodes?.length) {
    return <Typography color="text.secondary">エピソードがありません。</Typography>
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {episodes.map((episode) => (
        <PodcastEpisodeCard key={episode.id} episode={episode} />
      ))}
    </Box>
  )
}
