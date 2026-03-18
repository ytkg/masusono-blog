import Box from "@mui/material/Box"
import CollapsedMiniPlayerThumbnail from "./CollapsedMiniPlayerThumbnail"
import ExpandedMiniPlayerPanel from "./ExpandedMiniPlayerPanel"
import { useMiniPlayerFlipAnimation } from "../hooks/useMiniPlayerFlipAnimation"
import { useMiniPlayerDismissal } from "../hooks/useMiniPlayerDismissal"
import { useGlobalPodcastMiniPlayerUi } from "../hooks/useGlobalPodcastMiniPlayerUi"
import { useMiniPlayerVisibility } from "../hooks/useMiniPlayerVisibility"
import { usePodcastPlayer } from "../usePodcastPlayer"

export default function GlobalPodcastMiniPlayer() {
  const { currentEpisode, isPlaybackActive, currentTime, duration, togglePlayPause, pause, seekBy, seekTo } =
    usePodcastPlayer()
  const { isCollapsed, playerRef, containerStyle, containerSx, startDrag, expand, collapse } =
    useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode: currentEpisode != null })
  const { isDismissed, dismiss } = useMiniPlayerDismissal({
    hasCurrentEpisode: currentEpisode != null,
    isPlaying: isPlaybackActive,
    pause,
  })
  const { collapseWithAnimation, expandWithAnimation, animationSx } = useMiniPlayerFlipAnimation({
    isCollapsed,
    playerRef,
    collapse,
    expand,
  })

  const miniPlayerVisibility = useMiniPlayerVisibility({
    currentEpisodeId: currentEpisode?.id ?? null,
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
          isPlaying={isPlaybackActive}
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
