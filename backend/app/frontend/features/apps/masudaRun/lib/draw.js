export function drawCenterText(ctx, width, height, text) {
  const metrics = ctx.measureText(text)
  ctx.fillText(text, (width - metrics.width) / 2, height / 2)
}

export function drawSky(ctx, width, height) {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height)

  skyGradient.addColorStop(0, "#88cef4")
  skyGradient.addColorStop(0.15, "#a4d9f5")
  skyGradient.addColorStop(0.3, "#c9e9f9")
  skyGradient.addColorStop(0.43, "#e1f3fc")
  skyGradient.addColorStop(0.55, "#f2f9fd")
  skyGradient.addColorStop(0.65, "#ffffff")
  skyGradient.addColorStop(1, "#ffffff")
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height)
}

export function drawCloud(ctx, x, y, w, h, shape = {}) {
  const leftPuffX = shape.leftPuffX ?? 0.32
  const leftPuffY = shape.leftPuffY ?? 0.47
  const centerPuffY = shape.centerPuffY ?? 0.1
  const rightPuffY = shape.rightPuffY ?? 0.08
  const bodyGradient = ctx.createLinearGradient(x, y, x, y + h)

  bodyGradient.addColorStop(0, "#ffffff")
  bodyGradient.addColorStop(0.5, "#f8fafc")
  bodyGradient.addColorStop(1, "#b8c4d1")

  ctx.beginPath()
  ctx.moveTo(x + 0.07 * w, y + 0.73 * h)
  ctx.bezierCurveTo(x + 0.07 * w, y + 0.55 * h, x + 0.2 * w, y + 0.42 * h, x + leftPuffX * w, y + leftPuffY * h)
  ctx.bezierCurveTo(x + 0.34 * w, y + 0.22 * h, x + 0.48 * w, y + centerPuffY * h, x + 0.6 * w, y + 0.27 * h)
  ctx.bezierCurveTo(x + 0.69 * w, y + rightPuffY * h, x + 0.86 * w, y + 0.19 * h, x + 0.83 * w, y + 0.42 * h)
  ctx.bezierCurveTo(x + 0.97 * w, y + 0.43 * h, x + 1.01 * w, y + 0.6 * h, x + 0.93 * w, y + 0.73 * h)
  ctx.bezierCurveTo(x + 0.84 * w, y + 0.9 * h, x + 0.69 * w, y + 0.91 * h, x + 0.58 * w, y + 0.84 * h)
  ctx.bezierCurveTo(x + 0.42 * w, y + 0.98 * h, x + 0.2 * w, y + 0.92 * h, x + 0.07 * w, y + 0.73 * h)
  ctx.closePath()
  ctx.fillStyle = bodyGradient
  ctx.fill()

  const highlightGradient = ctx.createRadialGradient(
    x + 0.44 * w,
    y + 0.31 * h,
    0,
    x + 0.44 * w,
    y + 0.31 * h,
    0.34 * w,
  )

  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)")
  highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
  ctx.beginPath()
  ctx.ellipse(x + 0.44 * w, y + 0.35 * h, 0.31 * w, 0.22 * h, 0, 0, Math.PI * 2)
  ctx.fillStyle = highlightGradient
  ctx.fill()
}
