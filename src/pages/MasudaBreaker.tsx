import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import breakerBlocksSprite from '../assets/breaker_blocks.png'

type GamePhase = 'standby' | 'aim' | 'running' | 'clear' | 'over'

interface Paddle { x: number; y: number; w: number; h: number }
interface Ball { x: number; y: number; vx: number; vy: number; r: number; stuck: boolean }
interface Brick { x: number; y: number; w: number; h: number; alive: boolean; color: string; score: number; row: number; col: number }
interface Item { x: number; y: number; vy: number; r: number; active: boolean }

interface GameModel {
  ctx: CanvasRenderingContext2D
  paddle: Paddle
  balls: Ball[]
  bricks: Brick[]
  destroyed: number
  keys: { left: boolean; right: boolean }
  dragging: boolean
  animId: number | null
  lastTime: number
  combo: number
  advanceTimer: number
  items: Item[]
}

const WIDTH = 360
const HEIGHT = 520
const INITIAL_LIVES = 3
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 14
const PADDLE_Y = HEIGHT - 56
const PADDLE_SPEED = 420
const BALL_RADIUS = 8
const BALL_SPEED_START = 260
const BALL_SPEED_CAP = 410
const BALL_ACCELERATION = 6
const BRICK_ROWS = 10
const BRICK_COLS = 8
const BRICK_GAP = 2
const BRICK_MARGIN_X = 6
const BRICK_MARGIN_TOP = 60
const BRICK_MARGIN_BOTTOM = 130
const BRICK_WIDTH = (WIDTH - BRICK_MARGIN_X * 2 - (BRICK_COLS - 1) * BRICK_GAP) / BRICK_COLS
const BRICK_HEIGHT = (PADDLE_Y - BRICK_MARGIN_BOTTOM - BRICK_MARGIN_TOP - (BRICK_ROWS - 1) * BRICK_GAP) / BRICK_ROWS
const HIGH_KEY = 'masuda_breaker_highscore'
const BRICK_ADVANCE_INTERVAL = 7
const BRICK_ADVANCE_STEP = BRICK_HEIGHT + BRICK_GAP
const ITEM_DROP_CHANCE = 0.14
const ITEM_SPEED = 160
const ITEM_RADIUS = 8
const SPRITE_COLS = BRICK_COLS
const SPRITE_ROWS = BRICK_ROWS

const overlayTexts: Record<GamePhase, { title: string; body: string }> = {
  standby: {
    title: 'ようこそ 増田崩し',
    body:
      'キャンバスをタップすると開始できます。\nバーはドラッグまたは方向キーで操作します。\nブロックは時間とともに下がります。\nテンポよく壊しましょう。',
  },
  aim: {
    title: '準備完了',
    body:
      'ボールの位置を調整しましょう。\nキャンバスをタップかスペースでショット。\n発射後はブロックが一定間隔で迫ります。',
  },
  running: { title: '', body: '' },
  clear: {
    title: 'ステージクリア！',
    body: '全てのブロックを破壊しました。\nハイスコア更新に挑戦しましょう。',
  },
  over: {
    title: 'ゲームオーバー',
    body: '残機が尽きました。\nリトライで再挑戦できます。',
  },
}

const BRICK_COLOR = '#e4e4e4'
const brickScores = [40, 55, 70, 90, 110, 135, 165, 200, 240, 285]

function clamp(value: number, minValue: number, maxValue: number) {
  return Math.max(minValue, Math.min(maxValue, value))
}

function createBricks(): Brick[] {
  const bricks: Brick[] = []
  for (let row = 0; row < BRICK_ROWS; row += 1) {
    for (let col = 0; col < BRICK_COLS; col += 1) {
      const x = BRICK_MARGIN_X + col * (BRICK_WIDTH + BRICK_GAP)
      const y = BRICK_MARGIN_TOP + row * (BRICK_HEIGHT + BRICK_GAP)
      bricks.push({
        x,
        y,
        w: BRICK_WIDTH,
        h: BRICK_HEIGHT,
        alive: true,
        color: BRICK_COLOR,
        score: brickScores[row] ?? 40,
        row,
        col,
      })
    }
  }
  return bricks
}

function createBall(x: number, y: number, vx: number, vy: number, stuck: boolean): Ball {
  return { x, y, vx, vy, r: BALL_RADIUS, stuck }
}

function placeBallOnPaddle(ball: Ball, paddle: Paddle) {
  ball.x = paddle.x + paddle.w / 2
  ball.y = paddle.y - ball.r - 4
  ball.vx = 0
  ball.vy = 0
  ball.stuck = true
}

function resetBallsOnPaddle(model: GameModel) {
  const primary = createBall(0, 0, 0, 0, true)
  placeBallOnPaddle(primary, model.paddle)
  model.balls = [primary]
}

function alignStuckBallsToPaddle(model: GameModel) {
  for (const ball of model.balls) {
    if (!ball.stuck) continue
    placeBallOnPaddle(ball, model.paddle)
  }
}

function normalizeVelocity(ball: Ball, destroyed: number) {
  const base = BALL_SPEED_START + destroyed * BALL_ACCELERATION
  const target = clamp(base, BALL_SPEED_START, BALL_SPEED_CAP)
  const current = Math.hypot(ball.vx, ball.vy)
  if (!current || current === target) return
  const scale = target / current
  ball.vx *= scale
  ball.vy *= scale
}

function spawnExtraBall(model: GameModel, origin?: Ball) {
  const source = origin ?? model.balls[Math.floor(Math.random() * model.balls.length)] ?? null
  const startX = source ? source.x : model.paddle.x + model.paddle.w / 2
  const startY = source ? source.y : model.paddle.y - BALL_RADIUS - 6
  let vx = (Math.random() * 220 - 110)
  if (Math.abs(vx) < 60) vx = vx < 0 ? -60 : 60
  const vy = -Math.abs(source?.vy ?? BALL_SPEED_START)
  const extra = createBall(startX, startY, vx, vy, false)
  normalizeVelocity(extra, model.destroyed)
  model.balls.push(extra)
}

function advanceBricks(model: GameModel) {
  let reached = false
  for (const brick of model.bricks) {
    if (!brick.alive) continue
    brick.y += BRICK_ADVANCE_STEP
    if (brick.y + brick.h >= model.paddle.y - 8) {
      reached = true
    }
  }
  return reached
}

export default function MasudaBreaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<GameModel | null>(null)
  const phaseRef = useRef<GamePhase>('standby')
  const scoreRef = useRef(0)
  const livesRef = useRef(INITIAL_LIVES)
  const bestInitial = typeof window === 'undefined' ? 0 : Number(window.localStorage.getItem(HIGH_KEY) || 0)
  const bestRef = useRef(bestInitial)
  const blocksImgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = breakerBlocksSprite
    img.onload = () => {
      blocksImgRef.current = img
    }
    return () => {
      if (blocksImgRef.current === img) {
        blocksImgRef.current = null
      }
    }
  }, [])

  const setPhaseSafe = (value: GamePhase) => {
    if (phaseRef.current === value) return
    phaseRef.current = value
  }
  const syncScore = (value: number) => {
    scoreRef.current = value
  }
  const syncLives = (value: number) => {
    livesRef.current = value
  }
  const updateBest = (value: number) => {
    if (value <= bestRef.current) return
    bestRef.current = value
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HIGH_KEY, String(value))
    }
  }

  const startNewGame = () => {
    const model = gameRef.current
    if (!model) return
    model.bricks = createBricks()
    model.destroyed = 0
    model.paddle.x = (WIDTH - model.paddle.w) / 2
    model.combo = 0
    model.advanceTimer = 0
    model.items = []
    resetBallsOnPaddle(model)
    syncScore(0)
    syncLives(INITIAL_LIVES)
    setPhaseSafe('aim')
  }

  const launchBall = () => {
    const model = gameRef.current
    if (!model) return
    if (phaseRef.current !== 'aim') return
    const ball = model.balls.find((b) => b.stuck)
    if (!ball) return
    model.advanceTimer = 0
    const dir = Math.random() < 0.5 ? -1 : 1
    const angle = clamp((Math.random() * 0.45 + 0.2) * Math.PI, Math.PI * 0.32, Math.PI * 0.68)
    const speed = BALL_SPEED_START
    ball.vx = Math.sin(angle) * speed * dir
    ball.vy = -Math.cos(angle) * speed
    ball.stuck = false
    setPhaseSafe('running')
  }

  const finishRound = (cleared: boolean) => {
    const model = gameRef.current
    if (!model) return
    model.combo = 0
    model.advanceTimer = 0
    model.items = []
    resetBallsOnPaddle(model)
    if (cleared) {
      setPhaseSafe('clear')
      updateBest(scoreRef.current)
      return
    }
    const nextLives = Math.max(0, livesRef.current - 1)
    syncLives(nextLives)
    if (nextLives <= 0) {
      setPhaseSafe('over')
      updateBest(scoreRef.current)
    } else {
      setPhaseSafe('aim')
    }
  }

  const updatePointer = (clientX: number) => {
    const canvas = canvasRef.current
    const model = gameRef.current
    if (!canvas || !model) return
    const rect = canvas.getBoundingClientRect()
    const ratio = rect.width ? (clientX - rect.left) / rect.width : 0
    const center = clamp(ratio, 0, 1) * WIDTH
    const left = clamp(center - model.paddle.w / 2, 0, WIDTH - model.paddle.w)
    model.paddle.x = left
    alignStuckBallsToPaddle(model)
  }

  const tick = (timestamp: number) => {
    const model = gameRef.current
    if (!model) return
    let delta = (timestamp - model.lastTime) / 1000
    if (!Number.isFinite(delta) || delta <= 0) delta = 0
    if (delta > 0.04) delta = 0.04
    model.lastTime = timestamp

    const moveDir = (model.keys.left ? -1 : 0) + (model.keys.right ? 1 : 0)
    if (moveDir !== 0) {
      const next = model.paddle.x + moveDir * PADDLE_SPEED * delta
      model.paddle.x = clamp(next, 0, WIDTH - model.paddle.w)
      alignStuckBallsToPaddle(model)
    }

    let advancedReach = false
    if (phaseRef.current === 'running') {
      model.advanceTimer += delta
      while (model.advanceTimer >= BRICK_ADVANCE_INTERVAL) {
        model.advanceTimer -= BRICK_ADVANCE_INTERVAL
        if (advanceBricks(model)) {
          advancedReach = true
          break
        }
      }
      if (advancedReach) {
        finishRound(false)
        drawScene(model)
        model.animId = requestAnimationFrame(tick)
        return
      }
    }

    if (phaseRef.current === 'running') {
      for (let i = model.balls.length - 1; i >= 0; i -= 1) {
        const ball = model.balls[i]
        if (ball.stuck) continue

        ball.x += ball.vx * delta
        ball.y += ball.vy * delta

        if (ball.x - ball.r < 0) {
          ball.x = ball.r
          ball.vx = Math.abs(ball.vx)
        } else if (ball.x + ball.r > WIDTH) {
          ball.x = WIDTH - ball.r
          ball.vx = -Math.abs(ball.vx)
        }
        if (ball.y - ball.r < 32) {
          ball.y = 32 + ball.r
          ball.vy = Math.abs(ball.vy)
        }

        const paddle = model.paddle
        if (
          ball.vy > 0 &&
          ball.x + ball.r >= paddle.x &&
          ball.x - ball.r <= paddle.x + paddle.w &&
          ball.y + ball.r >= paddle.y &&
          ball.y - ball.r <= paddle.y + paddle.h
        ) {
          model.combo = 0
          ball.y = paddle.y - ball.r
          const ratio = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)
          const clamped = clamp(ratio, -0.95, 0.95)
          const angle = clamped * (Math.PI / 2.8)
          const speed = Math.hypot(ball.vx, ball.vy)
          ball.vx = Math.sin(angle) * speed
          ball.vy = -Math.cos(angle) * speed
          normalizeVelocity(ball, model.destroyed)
        }

        let hitBrick = false
        for (const brick of model.bricks) {
          if (!brick.alive) continue
          if (
            ball.x + ball.r > brick.x &&
            ball.x - ball.r < brick.x + brick.w &&
            ball.y + ball.r > brick.y &&
            ball.y - ball.r < brick.y + brick.h
          ) {
            brick.alive = false
            model.destroyed += 1
            model.combo += 1
            const comboBonus = Math.min(40, model.combo * 6)
            const nextScore = scoreRef.current + brick.score + comboBonus
            syncScore(nextScore)
            updateBest(nextScore)

            const overlapL = ball.x + ball.r - brick.x
            const overlapR = brick.x + brick.w - (ball.x - ball.r)
            const overlapT = ball.y + ball.r - brick.y
            const overlapB = brick.y + brick.h - (ball.y - ball.r)
            const minOverlap = Math.min(overlapL, overlapR, overlapT, overlapB)

            if (minOverlap === overlapL) {
              ball.x = brick.x - ball.r
              ball.vx = -Math.abs(ball.vx)
            } else if (minOverlap === overlapR) {
              ball.x = brick.x + brick.w + ball.r
              ball.vx = Math.abs(ball.vx)
            } else if (minOverlap === overlapT) {
              ball.y = brick.y - ball.r
              ball.vy = -Math.abs(ball.vy)
            } else {
              ball.y = brick.y + brick.h + ball.r
              ball.vy = Math.abs(ball.vy)
            }

            normalizeVelocity(ball, model.destroyed)

            if (Math.random() < ITEM_DROP_CHANCE) {
              model.items.push({
                x: brick.x + brick.w / 2,
                y: brick.y + brick.h / 2,
                vy: ITEM_SPEED,
                r: ITEM_RADIUS,
                active: true,
              })
            }

            hitBrick = true
            break
          }
        }
        if (hitBrick) continue

        if (ball.y - ball.r > HEIGHT + 24) {
          model.balls.splice(i, 1)
          model.combo = 0
          if (model.balls.length === 0) {
            finishRound(false)
            drawScene(model)
            model.animId = requestAnimationFrame(tick)
            return
          }
        }
      }
    }

    if (model.items.length) {
      for (const item of model.items) {
        if (!item.active) continue
        item.y += item.vy * delta
        if (
          item.y + item.r >= model.paddle.y &&
          item.y - item.r <= model.paddle.y + model.paddle.h &&
          item.x >= model.paddle.x &&
          item.x <= model.paddle.x + model.paddle.w
        ) {
          item.active = false
          spawnExtraBall(model)
          continue
        }
        if (item.y - item.r > HEIGHT) {
          item.active = false
        }
      }
      model.items = model.items.filter((item) => item.active)
    }

    if (phaseRef.current === 'running') {
      const alive = model.bricks.some((b) => b.alive)
      if (!alive) {
        finishRound(true)
        drawScene(model)
        model.animId = requestAnimationFrame(tick)
        return
      }
    }

    drawScene(model)
    model.animId = requestAnimationFrame(tick)
  }


  const drawScene = (model: GameModel) => {
    const { ctx, paddle, balls, bricks, items } = model
    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    for (let y = 40; y < HEIGHT; y += 40) ctx.fillRect(0, y, WIDTH, 1)
    for (let x = 40; x < WIDTH; x += 40) ctx.fillRect(x, 0, 1, HEIGHT)

    const sprite = blocksImgRef.current
    const tileW = sprite ? sprite.width / SPRITE_COLS : 0
    const tileH = sprite ? sprite.height / SPRITE_ROWS : 0
    for (const brick of bricks) {
      if (!brick.alive) continue
      if (sprite && tileW > 0 && tileH > 0) {
        const sx = brick.col * tileW
        const sy = brick.row * tileH
        ctx.drawImage(sprite, sx, sy, tileW, tileH, brick.x, brick.y, brick.w, brick.h)
      } else {
        ctx.fillStyle = brick.color
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h)
      }
    }

    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h)
    ctx.fillStyle = '#3b3b3b'
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h * 0.35)

    for (const ball of balls) {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fillStyle = '#111111'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(ball.x - ball.r * 0.35, ball.y - ball.r * 0.35, ball.r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fill()
    }

    for (const item of items) {
      if (!item.active) continue
      ctx.beginPath()
      ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(30, 30, 30, 0.85)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(item.x, item.y, item.r * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fill()
    }

    ctx.fillStyle = '#161616'
    ctx.font = '12px sans-serif'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText(`SCORE ${String(scoreRef.current).padStart(5, '0')}`, 12, 10)
    ctx.textAlign = 'center'
    ctx.fillText(`BEST ${String(bestRef.current).padStart(5, '0')}`, WIDTH / 2, 10)
    ctx.textAlign = 'right'
    ctx.fillText(`LIVES ${livesRef.current}`, WIDTH - 12, 10)
    ctx.textAlign = 'left'

    const overlay = overlayTexts[phaseRef.current]
    if (overlay && overlay.title) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      const boxWidth = WIDTH - 40
      const bodyLines = overlay.body.split('\n')
      const bodyLineHeight = 18
      const bodyHeight = bodyLines.length * bodyLineHeight
      const titleHeight = 28
      const paddingY = 18
      const boxHeight = paddingY * 2 + titleHeight + bodyHeight
      const boxX = (WIDTH - boxWidth) / 2
      const boxY = (HEIGHT - boxHeight) / 2
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'
      ctx.lineWidth = 2
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
      ctx.fillStyle = '#202020'
      ctx.font = 'bold 20px sans-serif'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(overlay.title, WIDTH / 2, boxY + paddingY + titleHeight / 2)
      ctx.font = '14px sans-serif'
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      const startY = boxY + paddingY + titleHeight + bodyLineHeight / 2
      bodyLines.forEach((line, idx) => {
        ctx.fillText(line, WIDTH / 2, startY + idx * bodyLineHeight)
      })
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const model: GameModel = {
      ctx,
      paddle: { x: (WIDTH - PADDLE_WIDTH) / 2, y: PADDLE_Y, w: PADDLE_WIDTH, h: PADDLE_HEIGHT },
      balls: [],
      bricks: createBricks(),
      destroyed: 0,
      keys: { left: false, right: false },
      dragging: false,
      animId: null,
      lastTime: performance.now(),
      combo: 0,
      advanceTimer: 0,
      items: [],
    }
    gameRef.current = model
    resetBallsOnPaddle(model)
    syncScore(0)
    syncLives(INITIAL_LIVES)
    setPhaseSafe('standby')
    drawScene(model)

    canvas.style.touchAction = 'none'

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const scale = rect.width ? Math.min(rect.width / WIDTH, 1) : 1
      canvas.style.width = `${WIDTH * scale}px`
      canvas.style.height = `${HEIGHT * scale}px`
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    const onPointerDown = (event: PointerEvent) => {
      const current = gameRef.current
      if (!current) return
      current.dragging = true
      canvas.setPointerCapture(event.pointerId)
      updatePointer(event.clientX)
      event.preventDefault()
    }
    const onPointerMove = (event: PointerEvent) => {
      const current = gameRef.current
      if (!current) return
      if (current.dragging || event.pointerType === 'mouse') {
        updatePointer(event.clientX)
      }
      event.preventDefault()
    }
    const onPointerUp = (event: PointerEvent) => {
      const current = gameRef.current
      if (!current) return
      current.dragging = false
      try {
        canvas.releasePointerCapture(event.pointerId)
      } catch {
        // ignore
      }
      if (phaseRef.current === 'standby' || phaseRef.current === 'over' || phaseRef.current === 'clear') {
        startNewGame()
        launchBall()
      } else if (phaseRef.current === 'aim') {
        launchBall()
      }
      event.preventDefault()
    }
    const onPointerLeave = () => {
      const current = gameRef.current
      if (current) current.dragging = false
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const current = gameRef.current
      if (!current) return
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        current.keys.left = true
        event.preventDefault()
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        current.keys.right = true
        event.preventDefault()
      } else if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
        event.preventDefault()
        if (phaseRef.current === 'standby' || phaseRef.current === 'over' || phaseRef.current === 'clear') {
          startNewGame()
          launchBall()
        } else if (phaseRef.current === 'aim') {
          launchBall()
        }
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const current = gameRef.current
      if (!current) return
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        current.keys.left = false
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        current.keys.right = false
      }
    }

    const animate = (ts: number) => {
      tick(ts)
    }
    model.animId = requestAnimationFrame(animate)

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      observer.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (model.animId) cancelAnimationFrame(model.animId)
      gameRef.current = null
    }
  }, [])

  return (
    <PageContainer>
      <Typography variant="h5" component="h2" gutterBottom>
        増田崩し
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: WIDTH,
          mx: 'auto',
          mt: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box ref={wrapRef} sx={{ width: '100%' }}>
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button component={RouterLink} to="/games" variant="outlined">
          ゲーム一覧に戻る
        </Button>
      </Box>
    </PageContainer>
  )
}
