import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Alert from "@mui/material/Alert"
import { usePodcasts } from "@/features/podcast/hooks/usePodcasts"
import ContentCardSkeletonList from "@/shared/ui/ContentCardSkeletonList"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

export default function PodcastEpisodesList() {
  const { data: episodes, isLoading, error } = usePodcasts()

  if (isLoading && !episodes) {
    return <ContentCardSkeletonList count={6} itemProps={{ subtitleWidth: "50%", mediaHeight: 40 }} />
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
