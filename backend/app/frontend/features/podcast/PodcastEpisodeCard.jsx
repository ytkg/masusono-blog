import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ContentItemCard from "../../shared/ContentItemCard"
import { usePodcastPlayer } from "../podcastPlayer/PodcastPlayerContext"

export default function PodcastEpisodeCard({ episode, mode = "list" }) {
  const { currentEpisode, isPlaying, playEpisode, stop } = usePodcastPlayer()

  if (!episode) {
    return (
      <ContentItemCard title="ポッドキャスト" titleComponent="h3">
        <Typography color="text.secondary">エピソードが見つかりません。</Typography>
      </ContentItemCard>
    )
  }

  const isCurrentEpisode = Boolean(episode?.id && currentEpisode?.id === episode.id)
  const isActiveEpisode = Boolean(isCurrentEpisode && isPlaying)
  const toggleIconLabel = isActiveEpisode ? "一時停止" : "再生"

  const handleToggle = () => {
    if (!episode) return
    if (isActiveEpisode) {
      stop()
      return
    }
    void playEpisode(episode)
  }

  return (
    <Box data-testid={`podcast-episode-card-${episode.id}`}>
      <ContentItemCard
        title={episode.title}
        titleVariant="h6"
        titleComponent={mode === "detail" ? "h1" : "h2"}
        titleTo={mode === "list" ? `/podcast/${episode.id}` : undefined}
        metaParts={[episode.publishedDate, `エピソード${episode.id}`]}
      >
        <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
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
              "&:hover": { bgcolor: isActiveEpisode ? "primary.dark" : "action.focus" },
              width: 36,
              height: 36,
            }}
          >
            {isActiveEpisode ? <PauseIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
          </IconButton>
        </Box>
      </ContentItemCard>
    </Box>
  )
}
