import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import type { PodcastEpisode } from "../types/podcast"
import ContentCard from "./ContentCard"
import ContentItemCard from "./ContentItemCard"

interface PodcastEpisodeCardProps {
  episode?: PodcastEpisode | null
  mode?: "list" | "detail"
  loading?: boolean
  error?: unknown
}

export default function PodcastEpisodeCard({ episode, mode = "list", loading, error }: PodcastEpisodeCardProps) {
  const isLoading = Boolean(loading)
  const errorMessage = error instanceof Error ? error.message : error != null ? String(error) : null
  const headingLevel = mode === "detail" ? "h1" : "h2"
  const titleVariant = "h5"
  const linkTo = mode === "list" && episode ? `/podcast/${episode.id}` : undefined
  const linkState = mode === "list" && episode ? { episode } : undefined

  if (isLoading) {
    return (
      <ContentCard>
        <Skeleton variant="text" width="80%" height={28} />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
      </ContentCard>
    )
  }

  if (errorMessage) {
    return (
      <ContentCard>
        <Alert severity="error">{errorMessage}</Alert>
      </ContentCard>
    )
  }

  if (!episode) {
    return (
      <ContentCard>
        <Typography color="text.secondary">エピソードが見つかりません。</Typography>
      </ContentCard>
    )
  }

  return (
    <ContentItemCard
      title={episode.title}
      titleVariant={titleVariant}
      titleComponent={headingLevel}
      titleTo={linkTo}
      titleState={linkState}
      metaParts={[episode.publishedDate, `Episode ${episode.id}`]}
    >
      <Box
        component="audio"
        controls
        preload="metadata"
        playsInline
        src={episode.audioUrl}
        aria-label={`エピソード音声: ${episode.title}`}
        sx={{ width: "100%" }}
      >
        お使いのブラウザでは音声再生に対応していません。
      </Box>
    </ContentItemCard>
  )
}
