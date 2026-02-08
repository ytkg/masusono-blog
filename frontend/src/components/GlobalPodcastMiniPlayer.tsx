import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react"
import Box from "@mui/material/Box"
import type { SxProps, Theme } from "@mui/material/styles"
import { useLocation } from "react-router-dom"
import CollapsedMiniPlayerThumbnail from "./globalPodcastMiniPlayer/CollapsedMiniPlayerThumbnail"
import ExpandedMiniPlayerPanel from "./globalPodcastMiniPlayer/ExpandedMiniPlayerPanel"
import { useCollapsedMiniPlayerDrag } from "./globalPodcastMiniPlayer/useCollapsedMiniPlayerDrag"
import { usePodcastPlayer } from "../features/podcastPlayer/PodcastPlayerContext"
import { shouldShowMiniPlayer } from "../features/podcastPlayer/miniPlayerVisibility"

const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='link']",
  "[role='slider']",
  "[contenteditable='true']",
].join(",")

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return target.closest(INTERACTIVE_SELECTOR) != null
}

export default function GlobalPodcastMiniPlayer() {
  const location = useLocation()
  const { currentEpisode, isPlaying, currentTime, duration, visibleEpisodeIds, togglePlayPause, seekBy, seekTo } =
    usePodcastPlayer()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { playerRef, containerStyle, isCustomCollapsedPosition, startDrag, shouldExpandAfterClick, resetPosition } =
    useCollapsedMiniPlayerDrag(isCollapsed)

  const isVisible = useMemo(
    () =>
      shouldShowMiniPlayer({
        pathname: location.pathname,
        currentEpisodeId: currentEpisode?.id ?? null,
        visibleEpisodeIds,
      }),
    [location.pathname, currentEpisode?.id, visibleEpisodeIds],
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

  const collapseFromExpanded = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) return
    setIsCollapsed(true)
  }, [])

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

  if (!isVisible || !currentEpisode) return null

  return (
    <Box ref={playerRef} data-testid="global-podcast-mini-player" style={containerStyle} sx={containerSx}>
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
          onBackgroundClick={collapseFromExpanded}
        />
      )}
    </Box>
  )
}
