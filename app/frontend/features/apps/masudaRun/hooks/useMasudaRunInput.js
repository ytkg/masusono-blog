import { useEffect } from "react"
import { attachKeyboardHandlers, attachPointerHandler } from "../lib"

export const useMasudaRunInput = ({ active = true, state, canvasRef, startOrRestart, doJump }) => {
  useEffect(() => {
    if (!active) return
    return attachKeyboardHandlers(state, startOrRestart, doJump)
  }, [active, state, startOrRestart, doJump])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    return attachPointerHandler(canvas, state, startOrRestart, doJump)
  }, [active, state, startOrRestart, doJump, canvasRef])
}
