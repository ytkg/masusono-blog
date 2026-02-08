import { useCallback, useEffect, useMemo, useState } from "react"
import type { Theme } from "@mui/material/styles"
import type { SystemStyleObject } from "@mui/system"
import { useCollapsedMiniPlayerDrag } from "@/features/podcastPlayer/hooks/useCollapsedMiniPlayerDrag"
import {
  MINI_PLAYER_CONTAINER_BOTTOM,
  MINI_PLAYER_CONTAINER_LEFT_EXPANDED,
  MINI_PLAYER_CONTAINER_MAX_WIDTH_COLLAPSED,
  MINI_PLAYER_CONTAINER_RIGHT,
  MINI_PLAYER_CONTAINER_WIDTH_EXPANDED,
  MINI_PLAYER_CONTAINER_Z_INDEX_OFFSET,
} from "@/features/podcastPlayer/lib/miniPlayerStyleConstants"

interface UseGlobalPodcastMiniPlayerUiParams {
  hasCurrentEpisode: boolean
}

export function useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode }: UseGlobalPodcastMiniPlayerUiParams) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const {
    playerRef,
    collapsedPosition,
    containerStyle,
    isCustomCollapsedPosition,
    startDrag,
    shouldExpandAfterClick,
    resetPosition,
  } = useCollapsedMiniPlayerDrag(isCollapsed)

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

  const containerSx = useMemo<SystemStyleObject<Theme>>(
    () => ({
      position: "fixed",
      right: isCustomCollapsedPosition ? "auto" : MINI_PLAYER_CONTAINER_RIGHT,
      left: isCollapsed ? "auto" : MINI_PLAYER_CONTAINER_LEFT_EXPANDED,
      bottom: MINI_PLAYER_CONTAINER_BOTTOM,
      width: isCollapsed ? "auto" : MINI_PLAYER_CONTAINER_WIDTH_EXPANDED,
      ...(isCollapsed ? { maxWidth: MINI_PLAYER_CONTAINER_MAX_WIDTH_COLLAPSED } : {}),
      zIndex: (theme: Theme) => theme.zIndex.appBar + MINI_PLAYER_CONTAINER_Z_INDEX_OFFSET,
    }),
    [isCollapsed, isCustomCollapsedPosition],
  )

  return {
    isCollapsed,
    playerRef,
    collapsedPosition,
    containerStyle,
    containerSx,
    startDrag,
    expand,
    collapse,
  }
}
