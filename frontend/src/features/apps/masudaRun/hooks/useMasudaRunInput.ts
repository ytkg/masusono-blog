import { useEffect, type MutableRefObject } from "react"
import { attachKeyboardHandlers, attachPointerHandler, type GameState } from "@/features/apps/masudaRun/lib"

type Params = {
  state: GameState
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
  startOrRestart: () => void
  doJump: () => void
  suppressClickRef: MutableRefObject<boolean>
}

export const useMasudaRunInput = ({ state, canvasRef, startOrRestart, doJump, suppressClickRef }: Params) => {
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

  const onPrimaryClick = () => {
    if (suppressClickRef.current) return false
    return true
  }

  return { onPrimaryPointerDown, onPrimaryClick }
}
