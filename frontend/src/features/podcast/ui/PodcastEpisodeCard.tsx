import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import ContentCard from "@/shared/ui/ContentCard"
import ContentItemCard from "@/shared/ui/ContentItemCard"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"

const ACTION_GROUP_SX = {
  mt: 1,
  display: "flex",
  gap: 1,
  flexWrap: "wrap",
  alignItems: "center",
} as const

interface PodcastEpisodeCardProps {
  episode?: PodcastEpisode | null
  mode?: "list" | "detail"
  loading?: boolean
  error?: unknown
}

export default function PodcastEpisodeCard({ episode, mode = "list", loading, error }: PodcastEpisodeCardProps) {
  const { currentEpisode, playEpisode, stop } = usePodcastPlayer()

  const isLoading = Boolean(loading)
  const errorMessage = error instanceof Error ? error.message : error != null ? String(error) : null
  const headingLevel = mode === "detail" ? "h1" : "h2"
  const titleVariant = "h5"
  const linkTo = mode === "list" && episode ? `/podcast/${episode.id}` : undefined
  const linkState = mode === "list" && episode ? { episode } : undefined
  const episodeId = episode?.id
  const isCurrentEpisode = Boolean(episodeId && currentEpisode?.id === episodeId)

  const handlePlayClick = () => {
    if (!episode) return
    void playEpisode(episode)
  }

  const handleStopClick = () => {
    if (!isCurrentEpisode) return
    stop()
  }

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
    <Box data-testid={`podcast-episode-card-${episode.id}`}>
      <ContentItemCard
        title={episode.title}
        titleVariant={titleVariant}
        titleComponent={headingLevel}
        titleTo={linkTo}
        titleState={linkState}
        metaParts={[episode.publishedDate, `Episode ${episode.id}`]}
      >
        <Box sx={ACTION_GROUP_SX} data-testid="podcast-episode-card-actions">
          <Button variant="contained" size="small" onClick={handlePlayClick} aria-label={`再生: ${episode.title}`}>
            再生
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleStopClick}
            disabled={!isCurrentEpisode}
            aria-label={`停止: ${episode.title}`}
          >
            停止
          </Button>
        </Box>
      </ContentItemCard>
    </Box>
  )
}
