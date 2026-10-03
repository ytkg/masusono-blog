import useAppLoadingTasks from "./useAppLoadingTasks"
import LauncherZoomTransition from "./LauncherZoomTransition"
import { animationDuration } from "./appDialogAnimation"
import AppLoadingScreen from "./AppLoadingScreen"
import AppDialogHeader from "./AppDialogHeader"
import { useId, useRef, useState } from "react"
import AppsIcon from "@mui/icons-material/Apps"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import Fade from "@mui/material/Fade"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import { AppsLoadingProvider } from "./AppsLoadingContext"

const launcherContainerSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1,
}

const launcherSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
}

const iconButtonBaseSx = {
  borderRadius: 2,
  width: 56,
  height: 56,
  bgcolor: "common.black",
  color: "common.white",
  "&:hover": { bgcolor: "common.black" },
}

const dialogPaperBaseSx = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}

const dialogContentSx = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 3,
  position: "relative",
  pt: "max(16px, env(safe-area-inset-top))",
  pr: "max(16px, env(safe-area-inset-right))",
  pb: "max(16px, env(safe-area-inset-bottom))",
  pl: "max(16px, env(safe-area-inset-left))",
}

const dialogBodyBaseSx = {
  flexGrow: 1,
  overflow: "auto",
}

export default function AppsDialogLauncher({
  title,
  launcherLabel,
  buttonAriaLabel,
  children,
  onOpen,
  onClose,
  beforeClose,
  buttonSx,
  buttonIcon,
  paperSx,
  contentSx,
  showLauncherLabel = true,
  titleAccessory,
}) {
  const [open, setOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isTransitionComplete, setIsTransitionComplete] = useState(false)
  const { registerLoadingTask, resetLoadingTasks, isContentVisible, loadingTaskCount, completedTaskCount } =
    useAppLoadingTasks(isTransitionComplete)
  const [transitionOrigin, setTransitionOrigin] = useState({
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    borderRadius: 8,
  })
  const launcherButtonRef = useRef(null)
  const titleId = useId()
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const launcherLabelText = launcherLabel ?? title
  const iconButtonSx = buttonSx ? [iconButtonBaseSx, buttonSx] : iconButtonBaseSx
  const dialogPaperSx = paperSx ? [dialogPaperBaseSx, paperSx] : dialogPaperBaseSx
  const interactionSx = { pointerEvents: isTransitioning ? "none" : "auto" }
  const dialogBodySx = contentSx ? [dialogBodyBaseSx, contentSx, interactionSx] : [dialogBodyBaseSx, interactionSx]

  const updateTransitionOrigin = () => {
    const rect = launcherButtonRef.current?.getBoundingClientRect()
    if (!rect) return

    setTransitionOrigin({
      left: rect.left,
      top: rect.top,
      width: Math.max(rect.width, 1),
      height: Math.max(rect.height, 1),
      borderRadius: 8,
    })
  }

  const handleOpen = () => {
    updateTransitionOrigin()
    setIsTransitionComplete(false)
    resetLoadingTasks()
    setIsTransitioning(true)
    onOpen?.(registerLoadingTask)
    setOpen(true)
  }

  const handleClose = () => {
    if (beforeClose && !beforeClose()) return
    updateTransitionOrigin()
    setIsTransitionComplete(false)
    setIsTransitioning(true)
    setOpen(false)
    onClose?.()
  }

  const handleEntered = () => {
    setIsTransitioning(false)
    setIsTransitionComplete(true)
    window.dispatchEvent(new Event("resize"))
  }

  const handleExited = () => {
    setIsTransitioning(false)
    launcherButtonRef.current?.focus()
  }

  return (
    <Box sx={launcherContainerSx}>
      <Box sx={launcherSx}>
        <IconButton ref={launcherButtonRef} aria-label={buttonAriaLabel} onClick={handleOpen} sx={iconButtonSx}>
          {buttonIcon ?? <AppsIcon />}
        </IconButton>
        {showLauncherLabel ? (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", width: "100%" }}>
            {launcherLabelText}
          </Typography>
        ) : null}
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby={titleId}
        fullScreen
        hideBackdrop
        scroll="paper"
        transitionDuration={prefersReducedMotion ? 150 : animationDuration}
        slots={{ transition: prefersReducedMotion ? Fade : LauncherZoomTransition }}
        slotProps={{
          transition: {
            ...(prefersReducedMotion ? {} : { origin: transitionOrigin }),
            onEntered: handleEntered,
            onExited: handleExited,
          },
        }}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <AppLoadingScreen
          title={title}
          buttonIcon={buttonIcon}
          isContentVisible={isContentVisible}
          completedTaskCount={completedTaskCount}
          loadingTaskCount={loadingTaskCount}
        />
        <Box
          data-testid="app-content"
          aria-hidden={!isContentVisible}
          inert={isContentVisible ? undefined : ""}
          sx={{
            ...dialogContentSx,
            opacity: isContentVisible ? 1 : 0,
            transition: "opacity 180ms ease",
            pointerEvents: isContentVisible ? "auto" : "none",
          }}
        >
          <AppDialogHeader title={title} titleId={titleId} accessory={titleAccessory} onClose={handleClose} />
          <AppsLoadingProvider value={registerLoadingTask}>
            <Box sx={dialogBodySx}>{children}</Box>
          </AppsLoadingProvider>
        </Box>
      </Dialog>
    </Box>
  )
}
