import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import ContentCard from "@/shared/ui/ContentCard"
import ContentItemCard from "@/shared/ui/ContentItemCard"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"
import { MINI_PLAYER_ARIA_LABELS } from "@/features/podcastPlayer/lib/miniPlayerA11y"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"

const ACTION_GROUP_SX = {
  mt: 1,
  display: "flex",
  gap: 1,
  flexWrap: "wrap",
  alignItems: "center",
} as const

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00"
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

interface PodcastEpisodeCardProps {
  episode?: PodcastEpisode | null
  mode?: "list" | "detail"
  loading?: boolean
  error?: unknown
}

export default function PodcastEpisodeCard({ episode, mode = "list", loading, error }: PodcastEpisodeCardProps) {
  const { currentEpisode, isPlaying, currentTime, playEpisode, stop } = usePodcastPlayer()

  const isLoading = Boolean(loading)
  const errorMessage = error instanceof Error ? error.message : error != null ? String(error) : null
  const headingLevel = mode === "detail" ? "h1" : "h2"
  const titleVariant = "h5"
  const linkTo = mode === "list" && episode ? `/podcast/${episode.id}` : undefined
  const linkState = mode === "list" && episode ? { episode } : undefined
  const episodeId = episode?.id
  const isCurrentEpisode = Boolean(episodeId && currentEpisode?.id === episodeId)

  const isActiveEpisode = Boolean(isCurrentEpisode && isPlaying)
  const toggleIconLabel = isActiveEpisode ? MINI_PLAYER_ARIA_LABELS.pause : MINI_PLAYER_ARIA_LABELS.play
  const displayTime = isCurrentEpisode ? currentTime : 0

  const handleToggle = () => {
    if (!episode) return
    if (isActiveEpisode) {
      stop()
      return
    }
    void playEpisode(episode)
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
          <IconButton
            color="primary"
            onClick={handleToggle}
            aria-label={toggleIconLabel}
            aria-pressed={isActiveEpisode}
            aria-live="polite"
            title={toggleIconLabel}
            sx={{
              bgcolor: isActiveEpisode ? "primary.main" : "action.selected",
              color: isActiveEpisode ? "primary.contrastText" : "text.secondary",
              "&:hover": {
                bgcolor: isActiveEpisode ? "primary.dark" : "action.focus",
              },
              width: 44,
              height: 44,
            }}
          >
            {isActiveEpisode ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
          <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", ml: 1 }}>
            {formatTime(displayTime)}
          </Typography>
        </Box>
      </ContentItemCard>
    </Box>
  )
}
