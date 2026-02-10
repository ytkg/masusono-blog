import type { GameState } from "./types"

export const attachKeyboardHandlers = (state: GameState, startOrRestart: () => void, doJump: () => void) => {
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat) return
    if (e.type === "keydown") {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault()
        if (state === "ready" || state === "gameover") {
          startOrRestart()
          return
        }
        doJump()
      } else if ((e.key === "r" || e.key === "R") && state === "gameover") {
        startOrRestart()
      }
    } else if (e.type === "keyup") {
      if (e.key === " " || e.key === "ArrowUp") e.preventDefault()
    }
  }
  window.addEventListener("keydown", onKey)
  window.addEventListener("keyup", onKey)
  return () => {
    window.removeEventListener("keydown", onKey)
    window.removeEventListener("keyup", onKey)
  }
}

export const attachPointerHandler = (
  canvas: HTMLCanvasElement,
  state: GameState,
  startOrRestart: () => void,
  doJump: () => void,
) => {
  const onPointerDown = () => {
    if (state === "ready" || state === "gameover") return startOrRestart()
    if (state === "playing") doJump()
  }
  canvas.addEventListener("pointerdown", onPointerDown)
  return () => canvas.removeEventListener("pointerdown", onPointerDown)
}
