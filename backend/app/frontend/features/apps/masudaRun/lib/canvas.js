import { CFG } from "./constants"

export const resizeCanvas = (wrap, canvas, scaleRef) => {
  const maxWidth = wrap.clientWidth || CFG.BASE_W
  const maxHeight = wrap.clientHeight
  const cssW = maxHeight > 0 ? Math.min(maxWidth, Math.floor((CFG.BASE_W / CFG.BASE_H) * maxHeight)) : maxWidth
  const cssH = Math.round((CFG.BASE_H / CFG.BASE_W) * cssW)
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const scale = (cssW * dpr) / CFG.BASE_W
  scaleRef.current = scale
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = Math.round(CFG.BASE_W * scale)
  canvas.height = Math.round(CFG.BASE_H * scale)
}
