import { cloneElement, forwardRef, useCallback, useEffect, useId, useRef, useState } from "react"
import { router } from "@inertiajs/react"
import AppsIcon from "@mui/icons-material/Apps"
import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import Fade from "@mui/material/Fade"
import IconButton from "@mui/material/IconButton"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Transition } from "react-transition-group"
import { AppsLoadingProvider } from "./AppsLoadingContext"

const animationDuration = { enter: 500, exit: 300 }
const animationEasing = "cubic-bezier(0.16, 1, 0.3, 1)"
const completionDisplayDuration = 500

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
  navigationHref,
}) {
  const [open, setOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isTransitionComplete, setIsTransitionComplete] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState({})
  const loadingTaskIdRef = useRef(0)
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

  const registerLoadingTask = useCallback((task) => {
    const taskId = loadingTaskIdRef.current
    loadingTaskIdRef.current += 1
    setLoadingTasks((tasks) => ({ ...tasks, [taskId]: false }))

    Promise.resolve(task)
      .catch(() => {
        // 失敗した読み込みも完了として扱い、起動画面に留まり続けないようにする
      })
      .finally(() => {
        setLoadingTasks((tasks) => (Object.hasOwn(tasks, taskId) ? { ...tasks, [taskId]: true } : tasks))
      })
  }, [])

  const handleOpen = (event) => {
    if (navigationHref && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) {
      return
    }

    event.preventDefault()
    updateTransitionOrigin()
    setIsTransitionComplete(false)
    setIsContentVisible(false)
    setLoadingTasks({})
    setIsTransitioning(true)
    onOpen?.(registerLoadingTask)
    setOpen(true)
  }

  const handleClose = () => {
    updateTransitionOrigin()
    setIsTransitionComplete(false)
    setIsContentVisible(false)
    setIsTransitioning(true)
    setOpen(false)
    onClose?.()
  }

  const handleEntered = () => {
    setIsTransitioning(false)
    setIsTransitionComplete(true)
    window.dispatchEvent(new Event("resize"))
    if (navigationHref) {
      router.visit(navigationHref, { onFinish: handleClose })
    }
  }

  const handleExited = () => {
    setIsTransitioning(false)
    launcherButtonRef.current?.focus()
  }

  const loadingTaskCount = Object.keys(loadingTasks).length
  const completedTaskCount = Object.values(loadingTasks).filter(Boolean).length
  const isLoadingComplete = !navigationHref && isTransitionComplete && completedTaskCount === loadingTaskCount
  const progressValue = loadingTaskCount === 0 ? 0 : Math.round((completedTaskCount / loadingTaskCount) * 100)

  useEffect(() => {
    if (!isLoadingComplete) {
      setIsContentVisible(false)
      return undefined
    }

    const timer = window.setTimeout(() => setIsContentVisible(true), completionDisplayDuration)
    return () => window.clearTimeout(timer)
  }, [isLoadingComplete])

  return (
    <Box sx={launcherContainerSx}>
      <Box sx={launcherSx}>
        <IconButton
          ref={launcherButtonRef}
          component={navigationHref ? "a" : "button"}
          href={navigationHref}
          aria-label={buttonAriaLabel}
          onClick={handleOpen}
          sx={iconButtonSx}
        >
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
          <AppsLoadingProvider value={registerLoadingTask}>
            <Box sx={dialogBodySx}>{children}</Box>
          </AppsLoadingProvider>
        </Box>
      </Dialog>
    </Box>
  )
}
