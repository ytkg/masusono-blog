import { memo, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"
import Box from "@mui/material/Box"
import CardMedia from "@mui/material/CardMedia"
import { MINI_PLAYER_ARIA_LABELS } from "@/features/podcastPlayer/lib/miniPlayerA11y"
import {
  MINI_PLAYER_CARD_BORDER_RADIUS,
  MINI_PLAYER_CARD_BOX_SHADOW,
  MINI_PLAYER_CARD_PADDING,
  MINI_PLAYER_THUMBNAIL_IMAGE_BORDER_RADIUS,
  MINI_PLAYER_THUMBNAIL_SIZE,
} from "@/features/podcastPlayer/lib/miniPlayerStyleConstants"

interface CollapsedMiniPlayerThumbnailProps {
  title: string
  onStartDrag: (event: ReactPointerEvent<HTMLElement>) => void
  onExpand: () => void
}

const thumbnailSx = {
  display: "block",
  p: MINI_PLAYER_CARD_PADDING,
  width: MINI_PLAYER_THUMBNAIL_SIZE,
  height: MINI_PLAYER_THUMBNAIL_SIZE,
  borderRadius: MINI_PLAYER_CARD_BORDER_RADIUS,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: MINI_PLAYER_CARD_BOX_SHADOW,
  overflow: "hidden",
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
}

function CollapsedMiniPlayerThumbnail({ title, onStartDrag, onExpand }: CollapsedMiniPlayerThumbnailProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    onExpand()
  }

  return (
    <Box
      component="button"
      type="button"
      data-testid="global-podcast-mini-player-thumbnail"
      aria-label={MINI_PLAYER_ARIA_LABELS.expand}
      onPointerDown={onStartDrag}
      onClick={onExpand}
      onKeyDown={handleKeyDown}
      sx={thumbnailSx}
    >
      <CardMedia
        component="img"
        image="/icons/icon-192.png"
        alt={title}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: MINI_PLAYER_THUMBNAIL_IMAGE_BORDER_RADIUS,
        }}
      />
    </Box>
  )
}

const MemoizedCollapsedMiniPlayerThumbnail = memo(CollapsedMiniPlayerThumbnail)
MemoizedCollapsedMiniPlayerThumbnail.displayName = "CollapsedMiniPlayerThumbnail"

export default MemoizedCollapsedMiniPlayerThumbnail
