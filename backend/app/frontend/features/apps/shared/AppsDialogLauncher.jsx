import { cloneElement, forwardRef, useId, useRef, useState } from "react"
import AppsIcon from "@mui/icons-material/Apps"
import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import Fade from "@mui/material/Fade"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Transition } from "react-transition-group"

const animationDuration = { enter: 350, exit: 250 }
const animationEasing = "cubic-bezier(0.2, 0.8, 0.2, 1)"

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

const dialogHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  minHeight: 44,
  pb: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
}

const dialogBodyBaseSx = {
  flexGrow: 1,
  overflow: "auto",
}

const closeButtonSx = {
  width: 44,
  height: 44,
  "&:hover": { bgcolor: "transparent" },
}

function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const LauncherZoomTransition = forwardRef(function LauncherZoomTransition(
  {
    children,
    in: inProp,
    origin,
    timeout = animationDuration,
    appear,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
  },
  ref,
) {
  const nodeRef = useRef(null)
  const setTransitionRef = (node) => {
    nodeRef.current = node
    setRef(ref, node)
    setRef(children.props.ref, node)
  }

  return (
    <Transition
      nodeRef={nodeRef}
      in={inProp}
      timeout={timeout}
      appear={appear}
      onEnter={onEnter}
      onEntering={onEntering}
      onEntered={onEntered}
      onExit={onExit}
      onExiting={onExiting}
      onExited={onExited}
    >
      {(state) => {
        const isVisible = state === "entering" || state === "entered"
        const duration = isVisible ? timeout.enter : timeout.exit
        const surface = cloneElement(children.props.children, {
          style: {
            ...children.props.children.props.style,
            opacity: isVisible ? 1 : 0,
            transition: `opacity ${isVisible ? 180 : 120}ms ${animationEasing} ${isVisible ? 110 : 0}ms`,
          },
        })

        return cloneElement(children, {
          ref: setTransitionRef,
          children: surface,
          style: {
            ...children.props.style,
            position: "fixed",
            top: isVisible ? 0 : origin.top,
            left: isVisible ? 0 : origin.left,
            width: isVisible ? "100dvw" : origin.width,
            height: isVisible ? "100dvh" : origin.height,
            backgroundColor: isVisible ? "#fff" : "#000",
            borderRadius: isVisible ? 0 : origin.borderRadius,
            overflow: "hidden",
            transition: `top ${duration}ms ${animationEasing}, left ${duration}ms ${animationEasing}, width ${duration}ms ${animationEasing}, height ${duration}ms ${animationEasing}, border-radius ${duration}ms ${animationEasing}, background-color ${duration}ms ${animationEasing}`,
            willChange: state === "entered" ? "auto" : "top, left, width, height, border-radius, background-color",
            backfaceVisibility: "hidden",
          },
        })
      }}
    </Transition>
  )
})

export default function AppsDialogLauncher({
  title,
  launcherLabel,
  buttonAriaLabel,
  children,
  onOpen,
  onClose,
  buttonSx,
  buttonIcon,
  paperSx,
  contentSx,
  showLauncherLabel = true,
  titleAccessory,
}) {
  const [open, setOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
    setIsTransitioning(true)
    onOpen?.()
    setOpen(true)
  }

  const handleClose = () => {
    updateTransitionOrigin()
    setIsTransitioning(true)
    setOpen(false)
    onClose?.()
  }

  const handleEntered = () => {
    setIsTransitioning(false)
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
        <Box sx={dialogContentSx}>
          <Box sx={dialogHeaderSx}>
            <Typography id={titleId} variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
              {titleAccessory}
              <IconButton aria-label="閉じる" onClick={handleClose} sx={closeButtonSx} autoFocus>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={dialogBodySx}>{children}</Box>
        </Box>
      </Dialog>
    </Box>
  )
}
