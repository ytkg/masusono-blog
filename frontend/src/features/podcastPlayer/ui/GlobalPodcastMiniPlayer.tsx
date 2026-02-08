import { useCallback, useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import type { SxProps, Theme } from "@mui/material/styles"
import { useLocation } from "react-router-dom"
import CollapsedMiniPlayerThumbnail from "./CollapsedMiniPlayerThumbnail"
import ExpandedMiniPlayerPanel from "./ExpandedMiniPlayerPanel"
import { useCollapsedMiniPlayerDrag } from "./useCollapsedMiniPlayerDrag"
import { useMiniPlayerVisibility } from "@/features/podcastPlayer/hooks/useMiniPlayerVisibility"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"

export default function GlobalPodcastMiniPlayer() {
  const location = useLocation()
  const { currentEpisode, isPlaying, currentTime, duration, visibleEpisodeId, togglePlayPause, seekBy, seekTo } =
    usePodcastPlayer()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { playerRef, containerStyle, isCustomCollapsedPosition, startDrag, shouldExpandAfterClick, resetPosition } =
    useCollapsedMiniPlayerDrag(isCollapsed)

  const miniPlayerVisibility = useMiniPlayerVisibility({
    pathname: location.pathname,
    currentEpisodeId: currentEpisode?.id ?? null,
    visibleEpisodeId,
  })

  const isVisible = miniPlayerVisibility.isVisible

  const containerSx = useMemo<SxProps<Theme>>(
    () => ({
      position: "fixed",
      right: isCustomCollapsedPosition ? "auto" : { xs: 8, sm: 12 },
      left: isCollapsed ? "auto" : { xs: 8, sm: "auto" },
      bottom: { xs: "calc(96px + env(safe-area-inset-bottom))", sm: 108 },
      width: isCollapsed ? "auto" : { xs: "calc(100% - 16px)", sm: 380 },
      ...(isCollapsed ? { maxWidth: "calc(100% - 16px)" } : {}),
      zIndex: (theme) => theme.zIndex.appBar + 1,
    }),
    [isCollapsed, isCustomCollapsedPosition],
  )

  useEffect(() => {
    if (!currentEpisode) {
      setIsCollapsed(false)
      resetPosition()
    }
  }, [currentEpisode, resetPosition])

  const expandFromCollapsed = useCallback(() => {
    if (!shouldExpandAfterClick()) return
    setIsCollapsed(false)
  }, [shouldExpandAfterClick])

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
          onCollapse={() => setIsCollapsed(true)}
        />
      )}
    </Box>
  )
}
