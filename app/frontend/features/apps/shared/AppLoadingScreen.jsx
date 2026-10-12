import AppsIcon from "@mui/icons-material/Apps"
import Box from "@mui/material/Box"
import LinearProgress from "@mui/material/LinearProgress"

const loadingIconSx = {
  width: "50%",
  aspectRatio: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  bgcolor: "common.white",
  color: "common.black",
  "& svg": { width: "60%", height: "60%", fontSize: "inherit" },
}

const visuallyHiddenSx = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
}

export default function AppLoadingScreen({
  title,
  buttonIcon,
  isContentVisible,
  completedTaskCount,
  loadingTaskCount,
}) {
  const progressValue = loadingTaskCount === 0 ? 0 : Math.round((completedTaskCount / loadingTaskCount) * 100)
  return (
    <Box
      role="status"
      aria-label={`${title}を読み込み中`}
      aria-live="polite"
      aria-hidden={isContentVisible}
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        color: "common.white",
        opacity: isContentVisible ? 0 : 1,
        transition: "opacity 180ms ease",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Box sx={loadingIconSx}>{buttonIcon ?? <AppsIcon />}</Box>
      <Box sx={{ width: "50%" }}>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          aria-label={`${title}の読み込み進捗`}
          aria-valuetext={`${completedTaskCount} / ${loadingTaskCount}`}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      <Box component="span" sx={visuallyHiddenSx}>{`${title}を読み込み中`}</Box>
    </Box>
  )
}
