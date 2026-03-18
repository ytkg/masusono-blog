import { memo } from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"
import CloseIcon from "@mui/icons-material/Close"
import PodcastAudioPlayer from "./PodcastAudioPlayer"
import { MINI_PLAYER_ARIA_LABELS } from "../lib/miniPlayerA11y"
import {
  MINI_PLAYER_CARD_BORDER_RADIUS,
  MINI_PLAYER_CARD_BOX_SHADOW,
  MINI_PLAYER_CARD_PADDING,
  MINI_PLAYER_CLOSE_BUTTON_LEFT,
  MINI_PLAYER_CLOSE_BUTTON_TOP,
  MINI_PLAYER_CLOSE_ICON_SIZE_PX,
  MINI_PLAYER_COLLAPSE_BUTTON_BOTTOM,
  MINI_PLAYER_COLLAPSE_BUTTON_LEFT,
  MINI_PLAYER_COLLAPSE_BUTTON_SIZE_PX,
  MINI_PLAYER_COLLAPSE_ICON_SIZE_PX,
} from "../lib/miniPlayerStyleConstants"
import { BUILD_VERSION } from "../../../shared/lib/buildVersion"

const panelSx = {
  position: "relative",
  borderRadius: MINI_PLAYER_CARD_BORDER_RADIUS,
  bgcolor: "background.paper",
  boxShadow: MINI_PLAYER_CARD_BOX_SHADOW,
  p: MINI_PLAYER_CARD_PADDING,
}

const collapseButtonSx = {
  position: "absolute",
  left: MINI_PLAYER_COLLAPSE_BUTTON_LEFT,
  bottom: MINI_PLAYER_COLLAPSE_BUTTON_BOTTOM,
  zIndex: 1,
  width: MINI_PLAYER_COLLAPSE_BUTTON_SIZE_PX,
  height: MINI_PLAYER_COLLAPSE_BUTTON_SIZE_PX,
}

const closeButtonSx = {
  position: "absolute",
  left: MINI_PLAYER_CLOSE_BUTTON_LEFT,
  top: MINI_PLAYER_CLOSE_BUTTON_TOP,
  zIndex: 1,
  width: MINI_PLAYER_COLLAPSE_BUTTON_SIZE_PX,
  height: MINI_PLAYER_COLLAPSE_BUTTON_SIZE_PX,
}

function ExpandedMiniPlayerPanel({
  title,
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause,
  onSeekBy,
  onSeekTo,
  onCollapse,
  onClose,
}) {
  const handleButtonKeyDown = (event, action) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    action()
  }

  return (
    <Box sx={panelSx}>
      <IconButton
        aria-label={MINI_PLAYER_ARIA_LABELS.close}
        size="small"
        onClick={onClose}
        onKeyDown={(event) => handleButtonKeyDown(event, onClose)}
        sx={closeButtonSx}
      >
        <CloseIcon sx={{ fontSize: MINI_PLAYER_CLOSE_ICON_SIZE_PX }} />
      </IconButton>
      <IconButton
        aria-label={MINI_PLAYER_ARIA_LABELS.collapse}
        size="small"
        onClick={onCollapse}
        onKeyDown={(event) => handleButtonKeyDown(event, onCollapse)}
        sx={collapseButtonSx}
      >
        <FullscreenExitIcon sx={{ fontSize: MINI_PLAYER_COLLAPSE_ICON_SIZE_PX }} />
      </IconButton>
      <PodcastAudioPlayer
        title={title}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlayback={onTogglePlayPause}
        onSeekBy={onSeekBy}
        onSeekTo={onSeekTo}
        variant="mini"
      />
      <Typography
        component="div"
        variant="caption"
        sx={{
          position: "absolute",
          right: 10,
          bottom: 10,
          color: "text.disabled",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.04em",
          fontSize: "0.6rem",
          lineHeight: 1,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        build {BUILD_VERSION}
      </Typography>
    </Box>
  )
}

const MemoizedExpandedMiniPlayerPanel = memo(ExpandedMiniPlayerPanel)
MemoizedExpandedMiniPlayerPanel.displayName = "ExpandedMiniPlayerPanel"

export default MemoizedExpandedMiniPlayerPanel
