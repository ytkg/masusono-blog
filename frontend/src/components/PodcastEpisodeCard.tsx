import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import type { PodcastEpisode } from "../types/podcast"
import ContentCard from "./ContentCard"
import ContentItemCard from "./ContentItemCard"
import PodcastAudioPlayer from "./PodcastAudioPlayer"
import { usePodcastPlayer } from "../features/podcastPlayer/PodcastPlayerContext"

interface PodcastEpisodeCardProps {
  episode?: PodcastEpisode | null
  mode?: "list" | "detail"
  loading?: boolean
  error?: unknown
}

export default function PodcastEpisodeCard({ episode, mode = "list", loading, error }: PodcastEpisodeCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playEpisode,
    togglePlayPause,
    seekTo,
    seekBy,
    setEpisodeVisibility,
  } = usePodcastPlayer()

  const isLoading = Boolean(loading)
  const errorMessage = error instanceof Error ? error.message : error != null ? String(error) : null
  const headingLevel = mode === "detail" ? "h1" : "h2"
  const titleVariant = "h5"
  const linkTo = mode === "list" && episode ? `/podcast/${episode.id}` : undefined
  const linkState = mode === "list" && episode ? { episode } : undefined
  const episodeId = episode?.id
  const isCurrentEpisode = Boolean(episodeId && currentEpisode?.id === episodeId)

  useEffect(() => {
    if (!episodeId) return

    if (!isCurrentEpisode) {
      setEpisodeVisibility(episodeId, false)
      return
    }

    const target = cardRef.current
    if (!target) return

    if (typeof IntersectionObserver === "undefined") {
      setEpisodeVisibility(episodeId, true)
      return () => {
        setEpisodeVisibility(episodeId, false)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setEpisodeVisibility(episodeId, Boolean(entry?.isIntersecting && entry.intersectionRatio > 0))
      },
      { threshold: [0, 0.1, 0.5, 1] },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
      setEpisodeVisibility(episodeId, false)
    }
  }, [episodeId, isCurrentEpisode, setEpisodeVisibility])

  const handleTogglePlayback = () => {
    if (!episode) return

    if (isCurrentEpisode) {
      void togglePlayPause()
      return
    }

    void playEpisode(episode)
  }

  const handleSeekBy = (deltaSeconds: number) => {
    if (!isCurrentEpisode) return
    seekBy(deltaSeconds)
  }

  const handleSeekTo = (value: number) => {
    if (!isCurrentEpisode) return
    seekTo(value)
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
    <Box ref={cardRef} data-testid={`podcast-episode-card-${episode.id}`}>
      <ContentItemCard
        title={episode.title}
        titleVariant={titleVariant}
        titleComponent={headingLevel}
        titleTo={linkTo}
        titleState={linkState}
        metaParts={[episode.publishedDate, `Episode ${episode.id}`]}
      >
        <PodcastAudioPlayer
          title={episode.title}
          isPlaying={isCurrentEpisode ? isPlaying : false}
          currentTime={isCurrentEpisode ? currentTime : 0}
          duration={isCurrentEpisode ? duration : 0}
          onTogglePlayback={handleTogglePlayback}
          onSeekBy={handleSeekBy}
          onSeekTo={handleSeekTo}
          disableSeek={!isCurrentEpisode}
        />
      </ContentItemCard>
    </Box>
  )
}
