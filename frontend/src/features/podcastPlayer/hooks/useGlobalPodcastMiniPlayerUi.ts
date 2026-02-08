import { useCallback, useEffect, useMemo, useState } from "react"
import type { SxProps, Theme } from "@mui/material/styles"
import { useCollapsedMiniPlayerDrag } from "@/features/podcastPlayer/hooks/useCollapsedMiniPlayerDrag"

interface UseGlobalPodcastMiniPlayerUiParams {
  hasCurrentEpisode: boolean
}

export function useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode }: UseGlobalPodcastMiniPlayerUiParams) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { playerRef, containerStyle, isCustomCollapsedPosition, startDrag, shouldExpandAfterClick, resetPosition } =
    useCollapsedMiniPlayerDrag(isCollapsed)

  useEffect(() => {
    if (!hasCurrentEpisode) {
      setIsCollapsed(false)
      resetPosition()
    }
  }, [hasCurrentEpisode, resetPosition])

  const expand = useCallback(() => {
    if (!shouldExpandAfterClick()) return
    setIsCollapsed(false)
  }, [shouldExpandAfterClick])

  const collapse = useCallback(() => {
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

  return {
    isCollapsed,
    playerRef,
    containerStyle,
    containerSx,
    startDrag,
    expand,
    collapse,
  }
}
