import { useEffect, type MutableRefObject } from "react"
import { getNow, type GameState } from "@/features/apps/masudaRun/lib"

export const useMasudaRunRestartCooldown = (
  state: GameState,
  restartReadyAt: number,
  restartReadyAtRef: MutableRefObject<number>,
  setRestartReadyAt: (value: number) => void,
) => {
  useEffect(() => {
    if (state !== "gameover" || restartReadyAt <= 0) return
    const remaining = restartReadyAt - getNow()
    if (remaining <= 0) {
      restartReadyAtRef.current = 0
      setRestartReadyAt(0)
      return
    }
    const id = window.setTimeout(() => {
      restartReadyAtRef.current = 0
      setRestartReadyAt(0)
    }, remaining)
    return () => window.clearTimeout(id)
  }, [state, restartReadyAt, restartReadyAtRef, setRestartReadyAt])
}
