import { CFG, CHAR_H, CHAR_W } from "./constants"
import { drawCenterText } from "./draw"

export const drawGround = (ctx, w, W) => {
  ctx.strokeStyle = "#000"
  ctx.beginPath()
  ctx.moveTo(0, w.groundY + 0.5)
  ctx.lineTo(W, w.groundY + 0.5)
  ctx.stroke()
}

export const drawStateText = (ctx, W, H, state) => {
  if (state === "ready") {
    ctx.font = '24px "Noto Sans JP", sans-serif'
    drawCenterText(ctx, W, H, "増田RUN - スペース/タップで開始")
  } else if (state === "gameover") {
    ctx.font = '24px "Noto Sans JP", sans-serif'
    drawCenterText(ctx, W, H, "GAME OVER  -  スペース/タップで再開")
  }
}

export const drawObstacles = (ctx, obstacles, imgs) => {
  ctx.fillStyle = "#000"
  for (const o of obstacles) {
    const img = o.kind === "tall" ? imgs.tall : imgs.short
    if (img) {
      const ratio = img.width / img.height
      const drawH = o.h * CFG.OBS_IMG_SCALE
      const drawW = Math.max(o.w, drawH * ratio)
      const drawX = o.x + (o.w - drawW) / 2
      const drawY = o.y - (drawH - o.h)
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    } else {
      ctx.fillRect(o.x, o.y, o.w, o.h)
    }
  }
}

export const drawPlayer = (ctx, p, img) => {
  const drawW = CHAR_W
  const drawH = CHAR_H
  const drawX = Math.round(p.x - (drawW - p.w) / 2)
  const drawY = Math.round(p.y + p.h - drawH)
  if (img) {
    if (p.spin > 0) {
      const progress = 1 - p.spin / CFG.SPIN_MS
      const angle = progress * Math.PI * 2
      ctx.save()
      const cx = drawX + drawW / 2
      const cy = drawY + drawH / 2
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
      ctx.restore()
    } else {
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    }
  } else {
    ctx.fillStyle = "#000"
    ctx.fillRect(drawX, drawY, drawW, drawH)
  }
}
