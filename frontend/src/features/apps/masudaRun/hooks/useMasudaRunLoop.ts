import { useCallback, useEffect, type MutableRefObject } from "react"
import {
  CFG,
  RESTART_DELAY_MS,
  drawCloud,
  drawGround,
  drawObstacles,
  drawPlayer,
  drawStateText,
  getNow,
  maybeSpawnCloud,
  maybeSpawnObstacle,
  persistHighScore,
  rectsIntersect,
  resizeCanvas,
  updateClouds,
  updateObstacles,
  updatePlayer,
  updateScoreDisplay,
  updateSpeed,
  type GameState,
  type World,
} from "@/features/apps/masudaRun/lib"

type LoopRefs = {
  scoreRef: MutableRefObject<number>
  scoreDisplayRef: MutableRefObject<number>
  restartReadyAtRef: MutableRefObject<number>
  worldRef: MutableRefObject<World>
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
  canvasWrapRef: MutableRefObject<HTMLDivElement | null>
  scaleRef: MutableRefObject<number>
  imgRef: MutableRefObject<HTMLImageElement | null>
  obsShortRef: MutableRefObject<HTMLImageElement | null>
  obsTallRef: MutableRefObject<HTMLImageElement | null>
  reqRef: MutableRefObject<number | null>
}

type Params = {
  state: GameState
  high: number
  setHigh: (value: number) => void
  setScore: (value: number) => void
  setState: (value: GameState) => void
  setRestartReadyAt: (value: number) => void
  refs: LoopRefs
}

export const useMasudaRunLoop = ({ state, high, setHigh, setScore, setState, setRestartReadyAt, refs }: Params) => {
  const {
    scoreRef,
    scoreDisplayRef,
    restartReadyAtRef,
    worldRef,
    canvasRef,
    canvasWrapRef,
    scaleRef,
    imgRef,
    obsShortRef,
    obsTallRef,
    reqRef,
  } = refs
  const update = useCallback(
    (dt: number, W: number) => {
      const w = worldRef.current
      if (state !== "playing") return

      updateSpeed(w, dt)
      updatePlayer(w)
      maybeSpawnObstacle(w, W, dt)
      updateObstacles(w)
      maybeSpawnCloud(w, W, dt)
      updateClouds(w)

      const p = w.player
      for (const o of w.obstacles) {
        if (rectsIntersect(p.x, p.y, p.w, p.h, o.x, o.y, o.w, o.h)) {
          const newHigh = Math.max(high, Math.floor(scoreRef.current))
          if (newHigh !== high) {
            setHigh(newHigh)
            persistHighScore(newHigh)
          }
          const readyAt = getNow() + RESTART_DELAY_MS
          restartReadyAtRef.current = readyAt
          setRestartReadyAt(readyAt)
          setState("gameover")
          return
        }
      }

      scoreRef.current += w.speed * dt * 0.01
    },
    [state, high, setHigh, setState, setRestartReadyAt, restartReadyAtRef, scoreRef, worldRef],
  )

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      const w = worldRef.current
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, W, H)

      for (const c of w.clouds) {
        ctx.save()
        ctx.globalAlpha = c.alpha
        drawCloud(ctx, c.x, c.y, c.w, c.h)
        ctx.restore()
      }
      drawGround(ctx, w, W)
      drawObstacles(ctx, w.obstacles, { short: obsShortRef.current, tall: obsTallRef.current })
      drawPlayer(ctx, w.player, imgRef.current)
      updateScoreDisplay(scoreRef, scoreDisplayRef, setScore)
      drawStateText(ctx, W, H, state)
    },
    [state, scoreRef, scoreDisplayRef, setScore, worldRef, imgRef, obsShortRef, obsTallRef],
  )

  useEffect(() => {
    const resize = () => {
      const wrap = canvasWrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return
      resizeCanvas(wrap, canvas, scaleRef)
    }
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("orientationchange", resize)
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("orientationchange", resize)
    }
  }, [canvasRef, canvasWrapRef, scaleRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      update(dt, CFG.BASE_W)
      const p = worldRef.current.player
      if (p.spin > 0) p.spin = Math.max(0, p.spin - dt)
      ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, 0, 0)
      draw(ctx, CFG.BASE_W, CFG.BASE_H)
      reqRef.current = requestAnimationFrame(loop)
    }
    reqRef.current = requestAnimationFrame(loop)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
      reqRef.current = null
    }
  }, [canvasRef, draw, update, scaleRef, worldRef, reqRef])
}
