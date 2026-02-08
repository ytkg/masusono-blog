import { memo, type PointerEvent as ReactPointerEvent } from "react"
import Box from "@mui/material/Box"
import CardMedia from "@mui/material/CardMedia"

interface CollapsedMiniPlayerThumbnailProps {
  title: string
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  onClick: () => void
}

const thumbnailSx = {
  display: "block",
  p: 0.75,
  width: { xs: 56, sm: 64 },
  height: { xs: 56, sm: 64 },
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: 3,
  overflow: "hidden",
  cursor: "grab",
  touchAction: "none",
  userSelect: "none",
  WebkitUserSelect: "none",
}

function CollapsedMiniPlayerThumbnail({ title, onPointerDown, onClick }: CollapsedMiniPlayerThumbnailProps) {
  return (
    <Box
      component="button"
      type="button"
      data-testid="global-podcast-mini-player-thumbnail"
      aria-label="プレイヤーを展開"
      onPointerDown={onPointerDown}
      onClick={onClick}
      sx={thumbnailSx}
    >
      <CardMedia
        component="img"
        image="/icons/icon-192.png"
        alt={title}
        sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1 }}
      />
    </Box>
  )
}

const MemoizedCollapsedMiniPlayerThumbnail = memo(CollapsedMiniPlayerThumbnail)
MemoizedCollapsedMiniPlayerThumbnail.displayName = "CollapsedMiniPlayerThumbnail"

export default MemoizedCollapsedMiniPlayerThumbnail
