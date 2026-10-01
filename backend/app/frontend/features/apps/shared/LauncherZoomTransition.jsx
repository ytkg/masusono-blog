import { cloneElement, forwardRef, useRef } from "react"
import { Transition } from "react-transition-group"

import { animationDuration } from "./appDialogAnimation"
const animationEasing = "cubic-bezier(0.16, 1, 0.3, 1)"

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

export default LauncherZoomTransition
