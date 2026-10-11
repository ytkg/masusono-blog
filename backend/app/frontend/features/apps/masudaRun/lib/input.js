export const attachKeyboardHandlers = (state, startOrRestart, doJump) => {
  const onKey = (e) => {
    if (e.repeat) return
    const isJumpKey = e.key === " " || e.key === "ArrowUp"
    if (e.type === "keydown") {
      if (isJumpKey) {
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
      if (isJumpKey) e.preventDefault()
    }
  }
  window.addEventListener("keydown", onKey)
  window.addEventListener("keyup", onKey)
  return () => {
    window.removeEventListener("keydown", onKey)
    window.removeEventListener("keyup", onKey)
  }
}

export const attachPointerHandler = (canvas, state, startOrRestart, doJump) => {
  const onPointerDown = () => {
    if (state === "ready" || state === "gameover") return startOrRestart()
    if (state === "playing") doJump()
  }
  canvas.addEventListener("pointerdown", onPointerDown)
  return () => canvas.removeEventListener("pointerdown", onPointerDown)
}
