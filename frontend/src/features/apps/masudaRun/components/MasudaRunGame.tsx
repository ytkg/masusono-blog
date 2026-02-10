import { useCallback, useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import charImgSrc from "@/assets/masuda_run.png"
import obsShortSrc from "@/assets/other1.png"
import obsTallSrc from "@/assets/other2.png"
import { useMasudaRunRankings } from "@/features/apps/masudaRun/hooks/useMasudaRunRankings"
import MasudaRunRankings from "@/features/apps/masudaRun/components/MasudaRunRankings"
import { CFG, CHAR_H, CHAR_W, HIT_H, RESTART_DELAY_MS } from "@/features/apps/masudaRun/lib/constants"
import {
  getStoredHighScore,
  createInitialWorld,
  persistHighScore,
  rectsIntersect,
} from "@/features/apps/masudaRun/lib/world"
import { drawCenterText, drawCloud } from "@/features/apps/masudaRun/lib/draw"
import { getNow } from "@/features/apps/masudaRun/lib/time"
import type { GameState, World } from "@/features/apps/masudaRun/lib/types"

export default function MasudaRunGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)
  const scaleRef = useRef(1)
  const reqRef = useRef<number | null>(null)
  const [state, setState] = useState<GameState>("ready")
  const scoreRef = useRef(0)
  const scoreDisplayRef = useRef(0)
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState<number>(() => getStoredHighScore())
  const suppressClickRef = useRef(false)
  const restartReadyAtRef = useRef(0)
  const [restartReadyAt, setRestartReadyAt] = useState(0)
  const { data: rankings, error: rankingsError, isLoading: rankingsLoading } = useMasudaRunRankings()

  const world = useRef<World>(createInitialWorld())

  const imgRef = useRef<HTMLImageElement | null>(null)
  const obsShortRef = useRef<HTMLImageElement | null>(null)
  const obsTallRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = charImgSrc
    img.onload = () => {
      imgRef.current = img
    }
    const s = new Image()
    s.src = obsShortSrc
    s.onload = () => {
      obsShortRef.current = s
    }
    const t = new Image()
    t.src = obsTallSrc
    t.onload = () => {
      obsTallRef.current = t
    }
    return () => {
      imgRef.current = null
      obsShortRef.current = null
      obsTallRef.current = null
    }
  }, [])

  const startOrRestart = useCallback(() => {
    const now = getNow()
    if (state === "gameover" && now < restartReadyAtRef.current) return
    world.current = createInitialWorld()
    scoreRef.current = 0
    scoreDisplayRef.current = 0
    setScore(0)
    restartReadyAtRef.current = 0
    setRestartReadyAt(0)
    setState("playing")
  }, [state])

  const doJump = useCallback(() => {
    if (state !== "playing") return
    const p = world.current.player
    if (p.jumps < CFG.MAX_JUMPS) {
      p.vy = CFG.JUMP_VY
      p.onGround = false
      p.jumps += 1
      if (p.jumps === 2) p.spin = CFG.SPIN_MS
    }
  }, [state])

  useEffect(() => {
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
  }, [state, startOrRestart, doJump])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onPointerDown = () => {
      if (state === "ready" || state === "gameover") return startOrRestart()
      if (state === "playing") doJump()
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    return () => canvas.removeEventListener("pointerdown", onPointerDown)
  }, [state, startOrRestart, doJump])

  useEffect(() => {
    if (state !== "gameover" || restartReadyAt <= 0) return
    const remaining = restartReadyAt - getNow()
    if (remaining <= 0) {
      restartReadyAtRef.current = 0
      setRestartReadyAt(0)
      return
    }
    const id = window.setTimeout(() => {
      restartReadyAtRef.current = 0
      setRestartReadyAt(0)
    }, remaining)
    return () => window.clearTimeout(id)
  }, [state, restartReadyAt])

  const update = useCallback(
    (dt: number, W: number) => {
      const w = world.current
      if (state !== "playing") return

      w.t += dt
      w.speed = CFG.SPEED_BASE + Math.min(CFG.SPEED_GAIN_MAX, w.t * CFG.SPEED_GAIN_RATE)

      const p = w.player
      p.vy += w.gravity
      p.y += p.vy
      p.h = HIT_H
      if (p.y + p.h >= w.groundY) {
        p.y = w.groundY - p.h
        p.vy = 0
        p.onGround = true
        p.jumps = 0
        p.spin = 0
      }

      w.nextSpawn -= dt
      if (w.nextSpawn <= 0) {
        const tall = Math.random() < CFG.TALL_PROB
        const h = tall ? CFG.TALL_H : CFG.SHORT_H_MIN + Math.random() * CFG.SHORT_H_RANGE
        const y = w.groundY - h
        const kind: World["obstacles"][number]["kind"] = tall ? "tall" : "short"
        const obs: World["obstacles"][number] = {
          x: W + 20,
          y,
          w: CFG.OBS_W_MIN + Math.random() * CFG.OBS_W_RANGE,
          h,
          kind,
        }
        w.obstacles.push(obs)
        w.nextSpawn =
          CFG.SPAWN_BASE - Math.min(CFG.SPAWN_REDUCE_MAX, w.t * CFG.SPAWN_REDUCE_RATE) + Math.random() * CFG.SPAWN_RAND
      }
      for (const o of w.obstacles) o.x -= w.speed
      w.obstacles = w.obstacles.filter((o) => o.x + o.w > -10)

      w.nextCloud -= dt
      if (w.nextCloud <= 0) {
        const y = 20 + Math.random() * Math.max(20, w.groundY - 160)
        const h = 18 + Math.random() * 22
        const wCloud = h * (1.8 + Math.random() * 0.8)
        const speed = CFG.CLOUD_SPEED_MIN + Math.random() * (CFG.CLOUD_SPEED_MAX - CFG.CLOUD_SPEED_MIN)
        const alpha = 0.35 + Math.random() * 0.25
        w.clouds.push({ x: W + 20, y, w: wCloud, h, speed, alpha })
        w.nextCloud = CFG.CLOUD_SPAWN_BASE + Math.random() * CFG.CLOUD_SPAWN_RAND
      }
      for (const c of w.clouds) c.x -= w.speed * 0.35 + c.speed
      w.clouds = w.clouds.filter((c) => c.x + c.w > -20)

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
    [state, high],
  )

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      const w = world.current
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, W, H)

      for (const c of w.clouds) {
        ctx.save()
        ctx.globalAlpha = c.alpha
        drawCloud(ctx, c.x, c.y, c.w, c.h)
        ctx.restore()
      }
      ctx.strokeStyle = "#000"
      ctx.beginPath()
      ctx.moveTo(0, w.groundY + 0.5)
      ctx.lineTo(W, w.groundY + 0.5)
      ctx.stroke()

      ctx.fillStyle = "#000"
      for (const o of w.obstacles) {
        const img = o.kind === "tall" ? obsTallRef.current : obsShortRef.current
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

      const p = w.player
      const img = imgRef.current
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

      const sc = Math.floor(scoreRef.current)
      if (scoreDisplayRef.current !== sc) {
        scoreDisplayRef.current = sc
        setScore(sc)
      }

      if (state === "ready") {
        ctx.font = '24px "Noto Sans JP", sans-serif'
        drawCenterText(ctx, W, H, "増田RUN - スペース/タップで開始")
      } else if (state === "gameover") {
        ctx.font = '24px "Noto Sans JP", sans-serif'
        drawCenterText(ctx, W, H, "GAME OVER  -  スペース/タップで再開")
      }
    },
    [state, high],
  )

  useEffect(() => {
    const resize = () => {
      const wrap = canvasWrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return
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
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("orientationchange", resize)
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("orientationchange", resize)
    }
  }, [])

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
      const p = world.current.player
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
  }, [draw, update])

  const restartCooling = state === "gameover" && restartReadyAt > 0
  const handlePrimaryAction = useCallback(() => {
    if (state === "playing") {
      doJump()
    } else {
      startOrRestart()
    }
  }, [state, doJump, startOrRestart])

  const containerSx = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    width: "100%",
  }

  return (
    <Box sx={containerSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          pb: 0.25,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 16 }}>
          スコア {score.toString().padStart(5, "0")}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 16 }}>
          ハイスコア {Math.max(high, score).toString().padStart(5, "0")}
        </Typography>
      </Box>
      <Box
        ref={canvasWrapRef}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden", width: "100%" }}
      >
        <canvas
          ref={canvasRef}
          width={CFG.BASE_W}
          height={CFG.BASE_H}
          tabIndex={0}
          style={{ width: "100%", height: "auto", display: "block", outline: "none" }}
        />
      </Box>
      <Box sx={{ width: "100%" }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disableRipple
          disabled={restartCooling}
          onPointerDown={(e) => {
            e.preventDefault()
            suppressClickRef.current = true
            window.setTimeout(() => {
              suppressClickRef.current = false
            }, 300)
            handlePrimaryAction()
          }}
          onClick={(e) => {
            e.preventDefault()
            if (suppressClickRef.current) return
            handlePrimaryAction()
          }}
        >
          {state === "playing" ? "ジャンプ" : state === "ready" ? "スタート" : "リスタート"}
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        操作: スペース/↑でジャンプ（タップでジャンプ）。ゲームオーバー時はスペース/タップで再開。
      </Typography>
      <MasudaRunRankings rankings={rankings} isLoading={rankingsLoading} hasError={Boolean(rankingsError)} />
    </Box>
  )
}
