export function drawCenterText(ctx: CanvasRenderingContext2D, width: number, height: number, text: string) {
  const metrics = ctx.measureText(text)
  ctx.fillText(text, (width - metrics.width) / 2, height / 2)
}

export function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2
  const parts = [
    { dx: 0.0, dy: 0.25, s: 1.0 },
    { dx: 0.25, dy: 0.05, s: 1.25 },
    { dx: 0.55, dy: 0.18, s: 1.05 },
    { dx: 0.8, dy: 0.12, s: 0.95 },
  ]
  ctx.fillStyle = "#e5e5e5"
  for (const p of parts) {
    const cx = x + p.dx * w
    const cy = y + p.dy * h
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * p.s, r * 0.9 * p.s, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.ellipse(x + 0.45 * w, y + 0.38 * h, r * 1.6, r * 0.9, 0, 0, Math.PI * 2)
  ctx.fillStyle = "#f0f0f0"
  ctx.fill()
}
