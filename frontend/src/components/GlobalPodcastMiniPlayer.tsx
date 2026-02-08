import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"
import Box from "@mui/material/Box"
import CardMedia from "@mui/material/CardMedia"
import { useLocation } from "react-router-dom"
import PodcastAudioPlayer from "./PodcastAudioPlayer"
import { usePodcastPlayer } from "../features/podcastPlayer/PodcastPlayerContext"
import { shouldShowMiniPlayer } from "../features/podcastPlayer/miniPlayerVisibility"

const EDGE_MARGIN = 8
const DEFAULT_PLAYER_SIZE = 72

type Position = {
  left: number
  top: number
}

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

type DragState = {
  pointerId: number
  offsetX: number
  offsetY: number
  startClientX: number
  startClientY: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function clampPosition(position: Position, width: number, height: number) {
  const maxLeft = Math.max(EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN)
  const maxTop = Math.max(EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN)
  return {
    left: clamp(position.left, EDGE_MARGIN, maxLeft),
    top: clamp(position.top, EDGE_MARGIN, maxTop),
  }
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return target.closest(INTERACTIVE_SELECTOR) != null
}

export default function GlobalPodcastMiniPlayer() {
  const location = useLocation()
  const { currentEpisode, isPlaying, currentTime, duration, visibleEpisodeIds, togglePlayPause, seekBy, seekTo } =
    usePodcastPlayer()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [collapsedPosition, setCollapsedPosition] = useState<Position | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const draggedRef = useRef(false)

  const isVisible = shouldShowMiniPlayer({
    pathname: location.pathname,
    currentEpisodeId: currentEpisode?.id ?? null,
    visibleEpisodeIds,
  })

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!isCollapsed) return
      if (event.pointerType === "mouse" && event.button !== 0) return

      const player = playerRef.current
      if (!player) return

      const rect = player.getBoundingClientRect()
      const width = rect.width || DEFAULT_PLAYER_SIZE
      const height = rect.height || DEFAULT_PLAYER_SIZE
      const initialPosition = clampPosition({ left: rect.left, top: rect.top }, width, height)
      setCollapsedPosition(initialPosition)
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
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current
      const player = playerRef.current
      if (!drag || !player || drag.pointerId !== event.pointerId) return

      const rect = player.getBoundingClientRect()
      const width = rect.width || DEFAULT_PLAYER_SIZE
      const height = rect.height || DEFAULT_PLAYER_SIZE
      const nextPosition = clampPosition(
        {
          left: event.clientX - drag.offsetX,
          top: event.clientY - drag.offsetY,
        },
        width,
        height,
      )
      if (Math.abs(event.clientX - drag.startClientX) > 3 || Math.abs(event.clientY - drag.startClientY) > 3) {
        draggedRef.current = true
      }
      setCollapsedPosition(nextPosition)
    }

    const handlePointerUp = (event: PointerEvent) => {
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
      const width = rect.width || DEFAULT_PLAYER_SIZE
      const height = rect.height || DEFAULT_PLAYER_SIZE
      setCollapsedPosition((prev) => (prev == null ? prev : clampPosition(prev, width, height)))
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isCollapsed, collapsedPosition])

  useEffect(() => {
    if (!currentEpisode) {
      setIsCollapsed(false)
      setCollapsedPosition(null)
    }
  }, [currentEpisode])

  if (!isVisible || !currentEpisode) return null

  const expandFromCollapsed = () => {
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    setIsCollapsed(false)
  }

  const collapseFromExpanded = (event: ReactMouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) return
    setIsCollapsed(true)
  }

  const isCustomCollapsedPosition = isCollapsed && collapsedPosition != null

  return (
    <Box
      ref={playerRef}
      data-testid="global-podcast-mini-player"
      style={
        isCustomCollapsedPosition
          ? {
              top: `${collapsedPosition.top}px`,
              left: `${collapsedPosition.left}px`,
              right: "auto",
              bottom: "auto",
            }
          : undefined
      }
      sx={{
        position: "fixed",
        right: isCustomCollapsedPosition ? "auto" : { xs: 8, sm: 12 },
        left: isCollapsed ? "auto" : { xs: 8, sm: "auto" },
        bottom: { xs: "calc(96px + env(safe-area-inset-bottom))", sm: 108 },
        width: isCollapsed ? "auto" : { xs: "calc(100% - 16px)", sm: 380 },
        maxWidth: isCollapsed ? "calc(100% - 16px)" : undefined,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      {isCollapsed ? (
        <Box
          component="button"
          type="button"
          data-testid="global-podcast-mini-player-thumbnail"
          aria-label="プレイヤーを展開"
          onPointerDown={startDrag}
          onClick={expandFromCollapsed}
          sx={{
            display: "block",
            p: 1,
            width: { xs: 68, sm: 76 },
            height: { xs: 68, sm: 76 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: 3,
            overflow: "hidden",
            cursor: "grab",
          }}
        >
          <CardMedia
            component="img"
            image="/icons/icon-192.png"
            alt={currentEpisode.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1 }}
          />
        </Box>
      ) : (
        <Box
          onClick={collapseFromExpanded}
          sx={{
            position: "relative",
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 3,
            p: 0.75,
          }}
        >
          <PodcastAudioPlayer
            title={currentEpisode.title}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onTogglePlayback={togglePlayPause}
            onSeekBy={seekBy}
            onSeekTo={seekTo}
            variant="mini"
          />
        </Box>
      )}
    </Box>
  )
}
