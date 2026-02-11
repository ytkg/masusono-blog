import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  MINI_PLAYER_DRAG_FALLBACK_SIZE_PX,
  MINI_PLAYER_DRAG_THRESHOLD_PX,
  MINI_PLAYER_EDGE_MARGIN_PX,
} from "../lib/miniPlayerStyleConstants"

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

function clampPosition(position, width, height) {
  const maxLeft = Math.max(MINI_PLAYER_EDGE_MARGIN_PX, window.innerWidth - width - MINI_PLAYER_EDGE_MARGIN_PX)
  const maxTop = Math.max(MINI_PLAYER_EDGE_MARGIN_PX, window.innerHeight - height - MINI_PLAYER_EDGE_MARGIN_PX)
  return {
    left: clamp(position.left, MINI_PLAYER_EDGE_MARGIN_PX, maxLeft),
    top: clamp(position.top, MINI_PLAYER_EDGE_MARGIN_PX, maxTop),
  }
}

function isSamePosition(a, b) {
  return a != null && a.left === b.left && a.top === b.top
}

export function useCollapsedMiniPlayerDrag(isCollapsed) {
  const [collapsedPosition, setCollapsedPosition] = useState(null)
  const playerRef = useRef(null)
  const dragStateRef = useRef(null)
  const draggedRef = useRef(false)

  const startDrag = useCallback(
    (event) => {
      if (!isCollapsed) return
      if (event.pointerType === "mouse" && event.button !== 0) return

      const player = playerRef.current
      if (!player) return

      const rect = player.getBoundingClientRect()
      const width = rect.width || MINI_PLAYER_DRAG_FALLBACK_SIZE_PX
      const height = rect.height || MINI_PLAYER_DRAG_FALLBACK_SIZE_PX
      const initialPosition = clampPosition({ left: rect.left, top: rect.top }, width, height)
      setCollapsedPosition((prev) => (isSamePosition(prev, initialPosition) ? prev : initialPosition))
      draggedRef.current = false
      dragStateRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - initialPosition.left,
        offsetY: event.clientY - initialPosition.top,
        startClientX: event.clientX,
        startClientY: event.clientY,
      }

      event.currentTarget.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    },
    [isCollapsed],
  )

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragStateRef.current
      const player = playerRef.current
      if (!drag || !player || drag.pointerId !== event.pointerId) return

      const rect = player.getBoundingClientRect()
      const width = rect.width || MINI_PLAYER_DRAG_FALLBACK_SIZE_PX
      const height = rect.height || MINI_PLAYER_DRAG_FALLBACK_SIZE_PX
      const nextPosition = clampPosition(
        {
          left: event.clientX - drag.offsetX,
          top: event.clientY - drag.offsetY,
        },
        width,
        height,
      )
      if (
        Math.abs(event.clientX - drag.startClientX) > MINI_PLAYER_DRAG_THRESHOLD_PX ||
        Math.abs(event.clientY - drag.startClientY) > MINI_PLAYER_DRAG_THRESHOLD_PX
      ) {
        draggedRef.current = true
      }

      setCollapsedPosition((prev) => (isSamePosition(prev, nextPosition) ? prev : nextPosition))
    }

    const handlePointerUp = (event) => {
      const drag = dragStateRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragStateRef.current = null
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [])

  useEffect(() => {
    if (!isCollapsed || collapsedPosition == null) return

    const handleResize = () => {
      const player = playerRef.current
      if (!player) return
      const rect = player.getBoundingClientRect()
      const width = rect.width || MINI_PLAYER_DRAG_FALLBACK_SIZE_PX
      const height = rect.height || MINI_PLAYER_DRAG_FALLBACK_SIZE_PX
      const nextPosition = clampPosition(collapsedPosition, width, height)
      setCollapsedPosition((prev) => (isSamePosition(prev, nextPosition) ? prev : nextPosition))
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isCollapsed, collapsedPosition])

  const shouldExpandAfterClick = useCallback(() => {
    if (draggedRef.current) {
      draggedRef.current = false
      return false
    }
    return true
  }, [])

  const resetPosition = useCallback(() => {
    setCollapsedPosition(null)
  }, [])

  const isCustomCollapsedPosition = isCollapsed && collapsedPosition != null

  const containerStyle = useMemo(
    () =>
      isCustomCollapsedPosition && collapsedPosition
        ? {
            top: `${collapsedPosition.top}px`,
            left: `${collapsedPosition.left}px`,
            right: "auto",
            bottom: "auto",
          }
        : undefined,
    [isCustomCollapsedPosition, collapsedPosition],
  )

  return {
    playerRef,
    collapsedPosition,
    containerStyle,
    isCustomCollapsedPosition,
    startDrag,
    shouldExpandAfterClick,
    resetPosition,
  }
}
