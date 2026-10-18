export const attachKeyboardHandlers = (state, startOrRestart, doJump) => {
  const onKey = (e) => {
    if (e.defaultPrevented || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return
    if (
      e.target instanceof Element &&
      e.target.closest(
        'input, textarea, select, button, a, [role="region"][tabindex], [contenteditable=""], [contenteditable="true"]',
      )
    )
      return
    const isJumpKey = e.key === " " || e.key === "ArrowUp"
    if (e.type === "keyup" || e.repeat) {
      if (isJumpKey) e.preventDefault()
      return
    }
    if (isJumpKey) {
      e.preventDefault()
      if (state === "ready" || state === "gameover") return startOrRestart()
      doJump()
    } else if ((e.key === "r" || e.key === "R") && state === "gameover") {
      startOrRestart()
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
  const onPointerDown = (event) => {
    if (event.button > 0) return
    if (state === "ready" || state === "gameover") return startOrRestart()
    if (state === "playing") doJump()
  }
  canvas.addEventListener("pointerdown", onPointerDown)
  return () => canvas.removeEventListener("pointerdown", onPointerDown)
}
