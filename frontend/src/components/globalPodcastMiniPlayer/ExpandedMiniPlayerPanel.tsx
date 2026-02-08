import { memo, type MouseEvent as ReactMouseEvent } from "react"
import Box from "@mui/material/Box"
import PodcastAudioPlayer from "../PodcastAudioPlayer"

interface ExpandedMiniPlayerPanelProps {
  title: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onTogglePlayback: () => void | Promise<void>
  onSeekBy: (deltaSeconds: number) => void
  onSeekTo: (value: number) => void
  onBackgroundClick: (event: ReactMouseEvent<HTMLElement>) => void
}

const panelSx = {
  position: "relative",
  borderRadius: 2,
  bgcolor: "background.paper",
  boxShadow: 3,
  p: 0.75,
}

function ExpandedMiniPlayerPanel({
  title,
  isPlaying,
  currentTime,
  duration,
  onTogglePlayback,
  onSeekBy,
  onSeekTo,
  onBackgroundClick,
}: ExpandedMiniPlayerPanelProps) {
  return (
    <Box onClick={onBackgroundClick} sx={panelSx}>
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
