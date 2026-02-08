import { memo } from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"
import PodcastAudioPlayer from "@/features/podcast/ui/PodcastAudioPlayer"
import {
  MINI_PLAYER_CARD_BORDER_RADIUS,
  MINI_PLAYER_CARD_BOX_SHADOW,
  MINI_PLAYER_CARD_PADDING,
  MINI_PLAYER_COLLAPSE_BUTTON_LEFT,
  MINI_PLAYER_COLLAPSE_BUTTON_SIZE_PX,
  MINI_PLAYER_COLLAPSE_BUTTON_TOP,
  MINI_PLAYER_COLLAPSE_ICON_SIZE_PX,
} from "@/features/podcastPlayer/lib/miniPlayerStyleConstants"

interface ExpandedMiniPlayerPanelProps {
  title: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onTogglePlayPause: () => void | Promise<void>
  onSeekBy: (deltaSeconds: number) => void
  onSeekTo: (value: number) => void
  onCollapse: () => void
}

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
  top: MINI_PLAYER_COLLAPSE_BUTTON_TOP,
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
}: ExpandedMiniPlayerPanelProps) {
  return (
    <Box sx={panelSx}>
      <IconButton aria-label="プレイヤーを縮小" size="small" onClick={onCollapse} sx={collapseButtonSx}>
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
    </Box>
  )
}

const MemoizedExpandedMiniPlayerPanel = memo(ExpandedMiniPlayerPanel)
MemoizedExpandedMiniPlayerPanel.displayName = "ExpandedMiniPlayerPanel"

export default MemoizedExpandedMiniPlayerPanel
