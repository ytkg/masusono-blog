import Box from "@mui/material/Box"
import { useLocation } from "react-router-dom"
import CollapsedMiniPlayerThumbnail from "./CollapsedMiniPlayerThumbnail"
import ExpandedMiniPlayerPanel from "./ExpandedMiniPlayerPanel"
import { useGlobalPodcastMiniPlayerUi } from "@/features/podcastPlayer/hooks/useGlobalPodcastMiniPlayerUi"
import { useMiniPlayerVisibility } from "@/features/podcastPlayer/hooks/useMiniPlayerVisibility"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"

export default function GlobalPodcastMiniPlayer() {
  const location = useLocation()
  const { currentEpisode, isPlaying, currentTime, duration, visibleEpisodeId, togglePlayPause, seekBy, seekTo } =
    usePodcastPlayer()
  const { isCollapsed, playerRef, containerStyle, containerSx, startDrag, expandFromCollapsed, collapse } =
    useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode: currentEpisode != null })

  const miniPlayerVisibility = useMiniPlayerVisibility({
    pathname: location.pathname,
    currentEpisodeId: currentEpisode?.id ?? null,
    visibleEpisodeId,
  })

  const isVisible = miniPlayerVisibility.isVisible

  if (!isVisible || !currentEpisode) return null

  return (
    <Box
      ref={playerRef}
      data-testid="global-podcast-mini-player"
      data-visibility-reason={miniPlayerVisibility.reason}
      style={containerStyle}
      sx={containerSx}
    >
      {isCollapsed ? (
        <CollapsedMiniPlayerThumbnail
          title={currentEpisode.title}
          onPointerDown={startDrag}
          onClick={expandFromCollapsed}
        />
      ) : (
        <ExpandedMiniPlayerPanel
          title={currentEpisode.title}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlayback={togglePlayPause}
          onSeekBy={seekBy}
          onSeekTo={seekTo}
          onCollapse={collapse}
        />
      )}
    </Box>
  )
}
