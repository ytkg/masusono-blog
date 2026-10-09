import { useEffect } from "react"
import { attachKeyboardHandlers, attachPointerHandler } from "../lib"

export const useMasudaRunInput = ({ state, canvasRef, startOrRestart, doJump, suppressClickRef }) => {
  useEffect(() => {
    return attachKeyboardHandlers(state, startOrRestart, doJump)
  }, [state, startOrRestart, doJump])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return attachPointerHandler(canvas, state, startOrRestart, doJump)
  }, [state, startOrRestart, doJump, canvasRef])

  const onPrimaryPointerDown = () => {
    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 300)
  }

  const onPrimaryClick = () => !suppressClickRef.current

  return { onPrimaryPointerDown, onPrimaryClick }
}
