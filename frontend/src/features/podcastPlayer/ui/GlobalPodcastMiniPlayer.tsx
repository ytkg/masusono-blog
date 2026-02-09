import Box from "@mui/material/Box"
import { useLocation } from "react-router-dom"
import CollapsedMiniPlayerThumbnail from "./CollapsedMiniPlayerThumbnail"
import ExpandedMiniPlayerPanel from "./ExpandedMiniPlayerPanel"
import { useMiniPlayerFlipAnimation } from "@/features/podcastPlayer/hooks/useMiniPlayerFlipAnimation"
import { useMiniPlayerDismissal } from "@/features/podcastPlayer/hooks/useMiniPlayerDismissal"
import { useGlobalPodcastMiniPlayerUi } from "@/features/podcastPlayer/hooks/useGlobalPodcastMiniPlayerUi"
import { useMiniPlayerVisibility } from "@/features/podcastPlayer/hooks/useMiniPlayerVisibility"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"

export default function GlobalPodcastMiniPlayer() {
  const location = useLocation()
  const { currentEpisode, isPlaying, currentTime, duration, visibleEpisodeId, togglePlayPause, pause, seekBy, seekTo } =
    usePodcastPlayer()
  const { isCollapsed, playerRef, containerStyle, containerSx, startDrag, expand, collapse } =
    useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode: currentEpisode != null })
  const { isDismissed, dismiss } = useMiniPlayerDismissal({
    hasCurrentEpisode: currentEpisode != null,
    isPlaying,
    pause,
  })
  const { collapseWithAnimation, expandWithAnimation, animationSx } = useMiniPlayerFlipAnimation({
    isCollapsed,
    playerRef,
    collapse,
    expand,
  })

  const miniPlayerVisibility = useMiniPlayerVisibility({
    pathname: location.pathname,
    currentEpisodeId: currentEpisode?.id ?? null,
    visibleEpisodeId,
  })

  const isVisible = miniPlayerVisibility.isVisible && !isDismissed

  if (!isVisible || !currentEpisode) return null

  return (
    <Box
      ref={playerRef}
      data-testid="global-podcast-mini-player"
      data-visibility-reason={miniPlayerVisibility.reason}
      style={containerStyle}
      sx={[containerSx, animationSx]}
    >
      {isCollapsed ? (
        <CollapsedMiniPlayerThumbnail
          title={currentEpisode.title}
          onStartDrag={startDrag}
          onExpand={expandWithAnimation}
        />
      ) : (
        <ExpandedMiniPlayerPanel
          title={currentEpisode.title}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlayPause={togglePlayPause}
          onSeekBy={seekBy}
          onSeekTo={seekTo}
          onCollapse={collapseWithAnimation}
          onClose={dismiss}
        />
      )}
    </Box>
  )
}
