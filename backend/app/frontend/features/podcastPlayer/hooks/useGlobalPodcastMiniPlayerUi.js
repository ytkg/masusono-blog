import { useCallback, useEffect, useMemo, useState } from "react"
import { useCollapsedMiniPlayerDrag } from "./useCollapsedMiniPlayerDrag"
import {
  MINI_PLAYER_CONTAINER_BOTTOM,
  MINI_PLAYER_CONTAINER_LEFT_EXPANDED,
  MINI_PLAYER_CONTAINER_MAX_WIDTH_COLLAPSED,
  MINI_PLAYER_CONTAINER_RIGHT,
  MINI_PLAYER_CONTAINER_WIDTH_EXPANDED,
  MINI_PLAYER_CONTAINER_Z_INDEX_OFFSET,
} from "../lib/miniPlayerStyleConstants"

export function useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode }) {
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

  const containerSx = useMemo(
    () => ({
      position: "fixed",
      right: isCustomCollapsedPosition ? "auto" : MINI_PLAYER_CONTAINER_RIGHT,
      left: isCollapsed ? "auto" : MINI_PLAYER_CONTAINER_LEFT_EXPANDED,
      bottom: MINI_PLAYER_CONTAINER_BOTTOM,
      width: isCollapsed ? "auto" : MINI_PLAYER_CONTAINER_WIDTH_EXPANDED,
      ...(isCollapsed ? { maxWidth: MINI_PLAYER_CONTAINER_MAX_WIDTH_COLLAPSED } : {}),
      zIndex: (theme) => theme.zIndex.appBar + MINI_PLAYER_CONTAINER_Z_INDEX_OFFSET,
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
