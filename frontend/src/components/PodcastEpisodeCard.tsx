import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import CardMedia from "@mui/material/CardMedia"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import IconButton from "@mui/material/IconButton"
import Slider from "@mui/material/Slider"
import Forward10Icon from "@mui/icons-material/Forward10"
import Replay10Icon from "@mui/icons-material/Replay10"
import PauseIcon from "@mui/icons-material/Pause"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
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
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setIsPlaying(false)
      }
      return
    }

    audio.pause()
  }

  const seekTo = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(value, duration || 0))
  }

  const seekBy = (deltaSeconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    seekTo((audio.currentTime || 0) + deltaSeconds)
  }

  const formatTime = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return "00:00"
    const totalSeconds = Math.floor(value)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
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
    <ContentItemCard
      title={episode.title}
      titleVariant={titleVariant}
      titleComponent={headingLevel}
      titleTo={linkTo}
      titleState={linkState}
      metaParts={[episode.publishedDate, `Episode ${episode.id}`]}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1.5, sm: 2 },
          p: { xs: 1.5, sm: 2 },
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
            width: { xs: 64, sm: 96 },
            height: { xs: 64, sm: 96 },
            borderRadius: 1.5,
            objectFit: "contain",
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
            <IconButton aria-label="10秒戻る" onClick={() => seekBy(-10)} size="small">
              <Replay10Icon />
            </IconButton>
            <IconButton aria-label={isPlaying ? "一時停止" : "再生"} onClick={togglePlayback} sx={{ mx: 0.5 }}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton aria-label="10秒進む" onClick={() => seekBy(10)} size="small">
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
            onChange={(_event, value) => {
              if (Array.isArray(value)) return
              setCurrentTime(value)
            }}
            onChangeCommitted={(_event, value) => {
              if (Array.isArray(value)) return
              seekTo(value)
            }}
            aria-label={`エピソード再生位置: ${episode.title}`}
            disabled={duration <= 0}
          />
        </Box>
      </Box>
      <Box
        component="audio"
        preload="metadata"
        playsInline
        src={episode.audioUrl}
        aria-label={`エピソード音声: ${episode.title}`}
        ref={audioRef}
        sx={{ display: "none" }}
      >
        お使いのブラウザでは音声再生に対応していません。
      </Box>
    </ContentItemCard>
  )
}
