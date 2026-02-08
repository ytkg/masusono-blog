import { memo } from "react"
import Box from "@mui/material/Box"
import CardMedia from "@mui/material/CardMedia"
import IconButton from "@mui/material/IconButton"
import Slider from "@mui/material/Slider"
import Typography from "@mui/material/Typography"
import Forward10Icon from "@mui/icons-material/Forward10"
import Replay10Icon from "@mui/icons-material/Replay10"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import {
  EMBEDDED_PLAYER_ARIA_LABELS,
  getEmbeddedPlayerSeekSliderAriaLabel,
  getMiniPlayerSeekSliderAriaLabel,
  MINI_PLAYER_ARIA_LABELS,
} from "@/features/podcastPlayer/lib/miniPlayerA11y"

interface PodcastAudioPlayerProps {
  title: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onTogglePlayback: () => void | Promise<void>
  onSeekBy: (deltaSeconds: number) => void
  onSeekTo: (value: number) => void
  disableSeek?: boolean
  variant?: "embedded" | "mini"
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "00:00"
  const totalSeconds = Math.floor(value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function PodcastAudioPlayer({
  title,
  isPlaying,
  currentTime,
  duration,
  onTogglePlayback,
  onSeekBy,
  onSeekTo,
  disableSeek = false,
  variant = "embedded",
}: PodcastAudioPlayerProps) {
  const isMini = variant === "mini"
  const canSeek = !disableSeek && duration > 0
  const labels = isMini ? MINI_PLAYER_ARIA_LABELS : EMBEDDED_PLAYER_ARIA_LABELS
  const seekSliderAriaLabel = isMini
    ? getMiniPlayerSeekSliderAriaLabel(title)
    : getEmbeddedPlayerSeekSliderAriaLabel(title)

  return (
    <Box
      sx={{
        display: "flex",
        gap: isMini ? 1.25 : { xs: 1.5, sm: 2 },
        p: isMini ? 1.25 : { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        alignItems: "center",
      }}
    >
      <CardMedia
        component="img"
        image="/icons/icon-192.png"
        alt="Podcast artwork"
        sx={{
          width: isMini ? { xs: 44, sm: 52 } : { xs: 64, sm: 96 },
          height: isMini ? { xs: 44, sm: 52 } : { xs: 64, sm: 96 },
          borderRadius: 1.5,
          objectFit: "contain",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isMini ? (
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap title={title}>
            {title}
          </Typography>
        ) : null}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <IconButton aria-label={labels.seekBackward10} onClick={() => onSeekBy(-10)} size="small" disabled={!canSeek}>
            <Replay10Icon />
          </IconButton>
          <IconButton
            aria-label={isPlaying ? labels.pause : labels.play}
            onClick={() => {
              void onTogglePlayback()
            }}
            sx={{ mx: 0.5 }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton aria-label={labels.seekForward10} onClick={() => onSeekBy(10)} size="small" disabled={!canSeek}>
            <Forward10Icon />
          </IconButton>
          <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", fontVariantNumeric: "tabular-nums" }}>
            {`${formatTime(currentTime)} / ${formatTime(duration)}`}
          </Typography>
        </Box>
        <Slider
          size="small"
          min={0}
          max={duration > 0 ? duration : 0}
          value={Math.min(currentTime, duration || 0)}
          onChangeCommitted={(_event, value) => {
            if (Array.isArray(value)) return
            onSeekTo(value)
          }}
          aria-label={seekSliderAriaLabel}
          disabled={!canSeek}
        />
      </Box>
    </Box>
  )
}

const MemoizedPodcastAudioPlayer = memo(PodcastAudioPlayer)
MemoizedPodcastAudioPlayer.displayName = "PodcastAudioPlayer"

export default MemoizedPodcastAudioPlayer
