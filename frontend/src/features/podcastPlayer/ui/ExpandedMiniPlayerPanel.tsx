import { memo } from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"
import PodcastAudioPlayer from "@/features/podcast/ui/PodcastAudioPlayer"

interface ExpandedMiniPlayerPanelProps {
  title: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onTogglePlayback: () => void | Promise<void>
  onSeekBy: (deltaSeconds: number) => void
  onSeekTo: (value: number) => void
  onCollapse: () => void
}

const panelSx = {
  position: "relative",
  borderRadius: 2,
  bgcolor: "background.paper",
  boxShadow: 3,
  p: 0.75,
}

const collapseButtonSx = {
  position: "absolute",
  left: { xs: 6, sm: 8 },
  top: { xs: 6, sm: 8 },
  zIndex: 1,
  width: 32,
  height: 32,
}

function ExpandedMiniPlayerPanel({
  title,
  isPlaying,
  currentTime,
  duration,
  onTogglePlayback,
  onSeekBy,
  onSeekTo,
  onCollapse,
}: ExpandedMiniPlayerPanelProps) {
  return (
    <Box sx={panelSx}>
      <IconButton aria-label="プレイヤーを縮小" size="small" onClick={onCollapse} sx={collapseButtonSx}>
        <FullscreenExitIcon sx={{ fontSize: 28 }} />
      </IconButton>
      <PodcastAudioPlayer
        title={title}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlayback={onTogglePlayback}
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
