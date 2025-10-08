import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import charImgSrc from '../assets/masuda_run.png'

type GameState = 'ready' | 'playing' | 'gameover'

export default function MasudaRun() {
  const BASE_W = 900
  const BASE_H = 300
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reqRef = useRef<number | null>(null)
  const [state, setState] = useState<GameState>('ready')
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState<number>(() => Number(localStorage.getItem('masudarun_highscore') || 0))

  // 画像・当たり判定サイズ（先に定義して初期状態から反映）
  const IMG_RATIO = 0.45
  const CHAR_H = Math.round(BASE_H * 0.42)
  const CHAR_W = Math.round(CHAR_H * IMG_RATIO)
  const HIT_W = Math.round(CHAR_W * 0.55)
  const HIT_H = Math.round(CHAR_H * 0.8)

  const world = useRef({
    t: 0,
    speed: 4.5,
    groundY: Math.round(BASE_H * 0.8),
    player: {
      x: 60,
      y: Math.round(BASE_H * 0.8) - HIT_H,
      vy: 0,
      w: HIT_W,
      h: HIT_H,
      onGround: true,
    },
    gravity: 0.6,
    obstacles: [] as Array<{ x: number; y: number; w: number; h: number }>,
    nextSpawn: 0,
  })


  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = charImgSrc
    img.onload = () => {
      imgRef.current = img
    }
    return () => { imgRef.current = null }
  }, [])

  const reset = () => {
    setScore(0)
    world.current = {
      t: 0,
      speed: 4.5,
      groundY: Math.round(BASE_H * 0.8),
      player: { x: 60, y: Math.round(BASE_H * 0.8) - HIT_H, vy: 0, w: HIT_W, h: HIT_H, onGround: true },
      gravity: 0.6,
      obstacles: [],
      nextSpawn: 0,
    }
  }

  // Controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const p = world.current.player
      if (e.type === 'keydown') {
        if (e.key === ' ' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (state === 'ready' || state === 'gameover') {
            reset()
            setState('playing')
            return
          }
          if (p.onGround) {
            p.vy = -11
            p.onGround = false
          }
        } else if ((e.key === 'r' || e.key === 'R') && state === 'gameover') {
          reset()
          setState('playing')
        }
      } else if (e.type === 'keyup') {
        if (e.key === ' ' || e.key === 'ArrowUp') e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    }
  }, [state])

  // Touch controls（スマホ: タップで開始/再開、プレイ中はジャンプ）
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const onPointerDown = () => {
      const p = world.current.player
      if (state === 'ready' || state === 'gameover') {
        reset()
        setState('playing')
      } else if (state === 'playing') {
        if (p.onGround) {
          p.vy = -11
          p.onGround = false
        }
      }
    }
    c.addEventListener('pointerdown', onPointerDown)
    return () => c.removeEventListener('pointerdown', onPointerDown)
  }, [state])

  // Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let last = performance.now()

    const loop = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now
      const W = BASE_W
      const H = BASE_H
      const w = world.current

      // Clear
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, W, H)
      // Ground
      ctx.strokeStyle = '#000'
      ctx.beginPath()
      ctx.moveTo(0, w.groundY + 0.5)
      ctx.lineTo(W, w.groundY + 0.5)
      ctx.stroke()

      if (state === 'playing') {
        w.t += dt
        // 難易度を緩やかに（初速低め + 上昇を緩く）
        w.speed = 4.5 + Math.min(3, w.t * 0.00025)

        // Player physics
        const p = w.player
        p.vy += w.gravity
        p.y += p.vy
        // 固定高さ（しゃがみ機能なし）
        p.h = HIT_H
        if (p.y + p.h >= w.groundY) {
          p.y = w.groundY - p.h
          p.vy = 0
          p.onGround = true
        }

        // Obstacles
        w.nextSpawn -= dt
        if (w.nextSpawn <= 0) {
          const tall = Math.random() < 0.15
          const h = tall ? 46 : 22 + Math.random() * 16
          const y = w.groundY - h
          const obs = { x: W + 20, y, w: 14 + Math.random() * 12, h }
          w.obstacles.push(obs)
          w.nextSpawn = 1400 - Math.min(700, w.t * 0.04) + Math.random() * 700
        }
        for (const o of w.obstacles) {
          o.x -= w.speed
        }
        // Remove off-screen
        w.obstacles = w.obstacles.filter((o) => o.x + o.w > -10)

        // Collision
        for (const o of w.obstacles) {
          if (rectsIntersect(p.x, p.y, p.w, p.h, o.x, o.y, o.w, o.h)) {
            const newHigh = Math.max(high, score)
            if (newHigh !== high) {
              setHigh(newHigh)
              localStorage.setItem('masudarun_highscore', String(newHigh))
            }
            setState('gameover')
          }
        }

        // Score
        setScore((s) => s + Math.floor(w.speed))
      }

      // Draw obstacles
      ctx.fillStyle = '#000'
      for (const o of world.current.obstacles) {
        ctx.fillRect(o.x, o.y, o.w, o.h)
      }
      // Draw player (image + ヒットボックスセンタリング)
      const p = world.current.player
      const img = imgRef.current
      const drawW = CHAR_W
      const drawH = CHAR_H
      const drawX = Math.round(p.x - (drawW - p.w) / 2)
      const drawY = Math.round(p.y + p.h - drawH)
      if (img) {
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
      } else {
        // フォールバック: 長方形
        ctx.fillStyle = '#000'
        ctx.fillRect(drawX, drawY, drawW, drawH)
      }

      // HUD
      ctx.fillStyle = '#000'
      ctx.font = '14px sans-serif'
      ctx.fillText(`SCORE ${score.toString().padStart(5, '0')}`, 10, 18)
      const hsc = Math.max(high, score)
      if (hsc) ctx.fillText(`HI ${hsc.toString().padStart(5, '0')}`, W - 100, 18)

      if (state === 'ready') {
        ctx.fillStyle = '#000'
        ctx.font = '16px sans-serif'
        drawCenterText(ctx, W, H, '増田ラン - スペース/タップで開始')
      } else if (state === 'gameover') {
        ctx.fillStyle = '#000'
        ctx.font = '16px sans-serif'
        drawCenterText(ctx, W, H, 'GAME OVER  -  スペース/タップで再開')
      }

      reqRef.current = requestAnimationFrame(loop)
    }
    reqRef.current = requestAnimationFrame(loop)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
      reqRef.current = null
    }
  }, [state, score, high])

  useEffect(() => {
    setHigh(Number(localStorage.getItem('masudarun_highscore') || 0))
  }, [])

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        増田ラン
      </Typography>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', width: '100%', maxWidth: BASE_W, mb: 1 }}>
        <canvas ref={canvasRef} width={BASE_W} height={BASE_H} tabIndex={0} style={{ width: '100%', display: 'block', outline: 'none' }} />
      </Box>
      <Typography variant="body2" color="text.secondary">
        操作: スペース/↑でジャンプ（タップでジャンプ）。ゲームオーバー時はスペースで再開。
      </Typography>
    </Box>
  )
}

function rectsIntersect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function drawCenterText(ctx: CanvasRenderingContext2D, W: number, H: number, text: string) {
  const m = ctx.measureText(text)
  ctx.fillText(text, (W - m.width) / 2, H / 2)
}
