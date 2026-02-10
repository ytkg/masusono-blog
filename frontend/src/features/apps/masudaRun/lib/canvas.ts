import { CFG } from "./constants"
import type { MutableRefObject } from "react"

export const resizeCanvas = (wrap: HTMLDivElement, canvas: HTMLCanvasElement, scaleRef: MutableRefObject<number>) => {
  const cssW = wrap.clientWidth || CFG.BASE_W
  const cssH = Math.round((CFG.BASE_H / CFG.BASE_W) * cssW)
  const dpr = Math.max(1, window.devicePixelRatio || 1)
  const scale = (cssW * dpr) / CFG.BASE_W
  scaleRef.current = scale
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = Math.round(CFG.BASE_W * scale)
  canvas.height = Math.round(CFG.BASE_H * scale)
}
