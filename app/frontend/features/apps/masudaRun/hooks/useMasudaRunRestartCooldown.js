import { useEffect } from "react"
import { getNow } from "../lib"

export const useMasudaRunRestartCooldown = (state, restartReadyAt, restartReadyAtRef, setRestartReadyAt) => {
  useEffect(() => {
    if (state !== "gameover" || restartReadyAt <= 0) return
    const clearRestartCooldown = () => {
      restartReadyAtRef.current = 0
      setRestartReadyAt(0)
    }
    const remaining = restartReadyAt - getNow()
    if (remaining <= 0) {
      clearRestartCooldown()
      return
    }
    const id = window.setTimeout(clearRestartCooldown, remaining)
    return () => window.clearTimeout(id)
  }, [state, restartReadyAt, restartReadyAtRef, setRestartReadyAt])
}
