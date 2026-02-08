import { useCallback, useEffect, useMemo, useRef } from "react"
import type { Theme } from "@mui/material/styles"
import type { SystemStyleObject } from "@mui/system"

const MINI_PLAYER_COLLAPSE_TO_THUMBNAIL_DURATION_MS = 260
const MINI_PLAYER_EXPAND_FROM_THUMBNAIL_DURATION_MS = 340

interface UseMiniPlayerFlipAnimationParams {
  isCollapsed: boolean
  playerRef: React.RefObject<HTMLDivElement | null>
  collapse: () => void
  expand: () => void
}

function shouldReduceMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useMiniPlayerFlipAnimation({
  isCollapsed,
  playerRef,
  collapse,
  expand,
}: UseMiniPlayerFlipAnimationParams) {
  const flipFromRectRef = useRef<DOMRect | null>(null)

  const collapseWithAnimation = useCallback(() => {
    if (isCollapsed) return
    flipFromRectRef.current = playerRef.current?.getBoundingClientRect() ?? null
    collapse()
  }, [collapse, isCollapsed, playerRef])

  const expandWithAnimation = useCallback(() => {
    if (!isCollapsed) return
    flipFromRectRef.current = playerRef.current?.getBoundingClientRect() ?? null
    expand()
  }, [expand, isCollapsed, playerRef])

  useEffect(() => {
    if (shouldReduceMotion()) {
      flipFromRectRef.current = null
      return
    }

    const fromRect = flipFromRectRef.current
    const element = playerRef.current
    if (!fromRect || !element) return
    if (typeof element.animate !== "function") {
      flipFromRectRef.current = null
      return
    }

    const toRect = element.getBoundingClientRect()
    flipFromRectRef.current = null
    if (toRect.width <= 0 || toRect.height <= 0) return

    const deltaX = fromRect.left - toRect.left
    const deltaY = fromRect.top - toRect.top
    const scaleX = fromRect.width / toRect.width
    const scaleY = fromRect.height / toRect.height

    element.animate(
      [
        {
          transformOrigin: "top left",
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        },
        {
          transformOrigin: "top left",
          transform: "translate(0, 0) scale(1, 1)",
        },
      ],
      {
        duration: isCollapsed
          ? MINI_PLAYER_COLLAPSE_TO_THUMBNAIL_DURATION_MS
          : MINI_PLAYER_EXPAND_FROM_THUMBNAIL_DURATION_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    )
  }, [isCollapsed, playerRef])

  const animationSx = useMemo<SystemStyleObject<Theme>>(
    () => ({
      transformOrigin: "bottom right",
      animation: isCollapsed
        ? "mini-player-collapse 260ms cubic-bezier(0.22, 1, 0.36, 1)"
        : "mini-player-expand 340ms cubic-bezier(0.22, 1, 0.36, 1)",
      "@keyframes mini-player-expand": {
        "0%": {
          opacity: 0,
          transform: "translateY(12px) scale(0.94)",
        },
        "100%": {
          opacity: 1,
          transform: "translateY(0) scale(1)",
        },
      },
      "@keyframes mini-player-collapse": {
        "0%": {
          opacity: 0,
          transform: "translateY(10px) scale(0.9)",
        },
        "100%": {
          opacity: 1,
          transform: "translateY(0) scale(1)",
        },
      },
      "@media (prefers-reduced-motion: reduce)": {
        animation: "none",
      },
    }),
    [isCollapsed],
  )

  return {
    collapseWithAnimation,
    expandWithAnimation,
    animationSx,
  }
}
