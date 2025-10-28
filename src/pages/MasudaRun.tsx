import { useCallback, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link as RouterLink } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import charImgSrc from '../assets/masuda_run.png'
import obsShortSrc from '../assets/other1.png'
import obsTallSrc from '../assets/other2.png'
import { usePageMeta } from '../hooks/usePageMeta'

// ===== Types =====
type GameState = 'ready' | 'playing' | 'gameover'

interface Player { x: number; y: number; vy: number; w: number; h: number; onGround: boolean; jumps: number; spin: number }
interface Obstacle { x: number; y: number; w: number; h: number; kind: 'short' | 'tall' }
interface Cloud { x: number; y: number; w: number; h: number; speed: number; alpha: number }
interface World {
  t: number
  speed: number
  groundY: number
  player: Player
  gravity: number
  obstacles: Obstacle[]
  nextSpawn: number
  clouds: Cloud[]
  nextCloud: number
}

// ===== Config =====
const CFG = {
  BASE_W: 900,
  BASE_H: 300,
  IMG_RATIO: 0.45, // 画像の幅/高さ
  CHAR_SCALE: 0.42, // キャラ描画高さ（キャンバス高に対する割合）
  HIT_W_RATIO: 0.55, // 当たり判定（画像幅に対する割合）
  HIT_H_RATIO: 0.8,  // 当たり判定（画像高に対する割合）
  GROUND_RATIO: 0.8,
  // 難易度（少し上げ、徐々に上がる）
  SPEED_BASE: 5.0,          // 初速を少し上げる
  SPEED_GAIN_MAX: 12.0,     // 上限速度の上げ幅を拡大（上限を延長）
  SPEED_GAIN_RATE: 0.00035, // 加速をやや強めに
  GRAVITY: 0.6,
  SPAWN_BASE: 1300,         // 出現間隔の基準を少し短く
  SPAWN_REDUCE_MAX: 1200,   // 時間とともにより短くなる（最小間隔をさらに短く）
  SPAWN_REDUCE_RATE: 0.06,  // 短縮率を少し強めに
  SPAWN_RAND: 700,
  TALL_PROB: 0.22,          // 背の高い障害物の確率を増やす
  TALL_H: 54,               // 背の高い障害物の高さ
  SHORT_H_MIN: 26,          // 低め障害物の最小高さ
  SHORT_H_RANGE: 20,        // 低め障害物の高さ幅
  OBS_W_MIN: 16,            // 障害物の最小幅
  OBS_W_RANGE: 16,          // 障害物の幅の幅
  MAX_JUMPS: 2,             // 二段ジャンプまで
  JUMP_VY: -11,             // ジャンプ初速度
  SPIN_MS: 500,             // 二段ジャンプ時の回転時間（ms）
  OBS_IMG_SCALE: 1.18,      // 障害物画像の拡大倍率（見た目のみ）
  // 雲（背景）
  CLOUD_SPAWN_BASE: 1600,
  CLOUD_SPAWN_RAND: 1400,
  CLOUD_SPEED_MIN: 0.4,
  CLOUD_SPEED_MAX: 1.0,
}

const RESTART_DELAY_MS = 600
const HIGH_SCORE_KEY = 'masudarun_highscore'

function getStoredHighScore() {
  if (typeof window === 'undefined') return 0
  return Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0)
}

const CHAR_H = Math.round(CFG.BASE_H * CFG.CHAR_SCALE)
const CHAR_W = Math.round(CHAR_H * CFG.IMG_RATIO)
const HIT_W = Math.round(CHAR_W * CFG.HIT_W_RATIO)
const HIT_H = Math.round(CHAR_H * CFG.HIT_H_RATIO)

function createInitialWorld(): World {
  const groundY = Math.round(CFG.BASE_H * CFG.GROUND_RATIO)
  return {
    t: 0,
    speed: CFG.SPEED_BASE,
    groundY,
    player: { x: 60, y: groundY - HIT_H, vy: 0, w: HIT_W, h: HIT_H, onGround: true, jumps: 0, spin: 0 },
    gravity: CFG.GRAVITY,
    obstacles: [],
    nextSpawn: 0,
    clouds: [],
    nextCloud: 0,
  }
}

// ===== Utils =====
function rectsIntersect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function drawCenterText(ctx: CanvasRenderingContext2D, W: number, H: number, text: string) {
  const m = ctx.measureText(text)
  ctx.fillText(text, (W - m.width) / 2, H / 2)
}

// ふわっとした雲（楕円の重ね合わせ）
function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = h / 2
  const parts = [
    { dx: 0.00, dy: 0.25, s: 1.0 },
    { dx: 0.25, dy: 0.05, s: 1.25 },
    { dx: 0.55, dy: 0.18, s: 1.05 },
    { dx: 0.80, dy: 0.12, s: 0.95 },
  ]
  ctx.fillStyle = '#e5e5e5'
  for (const p of parts) {
    const cx = x + p.dx * w
    const cy = y + p.dy * h
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * p.s, r * 0.9 * p.s, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.ellipse(x + 0.45 * w, y + 0.38 * h, r * 1.6, r * 0.9, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#f0f0f0'
  ctx.fill()
}

// 以前の素朴な雲描画を使用（オフスクリーン生成は未使用）

const getNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now())

// ===== Page =====
export default function MasudaRun() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)
  const scaleRef = useRef(1)
  const reqRef = useRef<number | null>(null)
  const [state, setState] = useState<GameState>('ready')
  const scoreRef = useRef(0)
  const [high, setHigh] = useState<number>(() => getStoredHighScore())
  const suppressClickRef = useRef(false)
  const restartReadyAtRef = useRef(0)
  const [restartReadyAt, setRestartReadyAt] = useState(0)
  usePageMeta({
    title: '増田RUN',
    description: '増田RUNは障害物をジャンプで避けながらハイスコアを目指すランゲームです。ブラウザで気軽に遊べます。',
    canonicalPath: '/games/run',
  })

  const world = useRef<World>(createInitialWorld())

  // 画像のプリロード（読み込み完了後は imgRef で描画）
  const imgRef = useRef<HTMLImageElement | null>(null)
  const obsShortRef = useRef<HTMLImageElement | null>(null)
  const obsTallRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new Image()
    img.src = charImgSrc
    img.onload = () => { imgRef.current = img }
    const s = new Image()
    s.src = obsShortSrc
    s.onload = () => { obsShortRef.current = s }
    const t = new Image()
    t.src = obsTallSrc
    t.onload = () => { obsTallRef.current = t }
    return () => { imgRef.current = null; obsShortRef.current = null; obsTallRef.current = null }
  }, [])

  const startOrRestart = useCallback(() => {
    const now = getNow()
    if (state === 'gameover' && now < restartReadyAtRef.current) return
    world.current = createInitialWorld()
    scoreRef.current = 0
    restartReadyAtRef.current = 0
    setRestartReadyAt(0)
    setState('playing')
  }, [state])

  const doJump = useCallback(() => {
    if (state !== 'playing') return
    const p = world.current.player
    // 空中でも最大回数まではジャンプ可能（着地でリセット）
    if (p.jumps < CFG.MAX_JUMPS) {
      p.vy = CFG.JUMP_VY
      p.onGround = false
      p.jumps += 1
      if (p.jumps === 2) {
        // 二段ジャンプで回転を開始
        p.spin = CFG.SPIN_MS
      }
    }
  }, [state])

  // キー操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.type === 'keydown') {
        if (e.key === ' ' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (state === 'ready' || state === 'gameover') { startOrRestart(); return }
          doJump()
        } else if ((e.key === 'r' || e.key === 'R') && state === 'gameover') {
          startOrRestart()
        }
      } else if (e.type === 'keyup') {
        if (e.key === ' ' || e.key === 'ArrowUp') e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [state, startOrRestart, doJump])

  // タップ操作（開始/再開、プレイ中はジャンプ）
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const onPointerDown = () => {
      if (state === 'ready' || state === 'gameover') return startOrRestart()
      if (state === 'playing') doJump()
    }
    c.addEventListener('pointerdown', onPointerDown)
    return () => c.removeEventListener('pointerdown', onPointerDown)
  }, [state, startOrRestart, doJump])

  // リスタートまでのクールダウンが過ぎたら自動で解除
  useEffect(() => {
    if (state !== 'gameover' || restartReadyAt <= 0) return
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

  // ロジック更新
  function update(dt: number, W: number) {
    const w = world.current
    if (state !== 'playing') return

    // 時間・速度
    w.t += dt
    w.speed = CFG.SPEED_BASE + Math.min(CFG.SPEED_GAIN_MAX, w.t * CFG.SPEED_GAIN_RATE)

    // プレイヤー物理
    const p = w.player
    p.vy += w.gravity
    p.y += p.vy
    p.h = HIT_H
    if (p.y + p.h >= w.groundY) { p.y = w.groundY - p.h; p.vy = 0; p.onGround = true; p.jumps = 0; p.spin = 0 }

    // 障害物生成 + 移動
    w.nextSpawn -= dt
    if (w.nextSpawn <= 0) {
      const tall = Math.random() < CFG.TALL_PROB
      const h = tall ? CFG.TALL_H : CFG.SHORT_H_MIN + Math.random() * CFG.SHORT_H_RANGE
      const y = w.groundY - h
      const obs: Obstacle = { x: W + 20, y, w: CFG.OBS_W_MIN + Math.random() * CFG.OBS_W_RANGE, h, kind: tall ? 'tall' : 'short' }
      w.obstacles.push(obs)
      w.nextSpawn = CFG.SPAWN_BASE - Math.min(CFG.SPAWN_REDUCE_MAX, w.t * CFG.SPAWN_REDUCE_RATE) + Math.random() * CFG.SPAWN_RAND
    }
    for (const o of w.obstacles) o.x -= w.speed
    w.obstacles = w.obstacles.filter((o) => o.x + o.w > -10)

    // 雲生成 + 移動（障害物と独立・当たり判定なし）
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
    for (const c of w.clouds) c.x -= (w.speed * 0.35 + c.speed)
    w.clouds = w.clouds.filter((c) => c.x + c.w > -20)

    // 当たり判定
    for (const o of w.obstacles) {
      if (rectsIntersect(p.x, p.y, p.w, p.h, o.x, o.y, o.w, o.h)) {
        const newHigh = Math.max(high, Math.floor(scoreRef.current))
        if (newHigh !== high) {
          setHigh(newHigh)
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(HIGH_SCORE_KEY, String(newHigh))
          }
        }
        const readyAt = getNow() + RESTART_DELAY_MS
        restartReadyAtRef.current = readyAt
        setRestartReadyAt(readyAt)
        setState('gameover')
        return
      }
    }

    // スコア加算（描画時に scoreRef を参照して描画）
    scoreRef.current += w.speed * dt * 0.01
  }

  // 描画
  function draw(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const w = world.current
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H)

    // 雲（背景）
    for (const c of w.clouds) {
      ctx.save()
      ctx.globalAlpha = c.alpha
      drawCloud(ctx, c.x, c.y, c.w, c.h)
      ctx.restore()
    }
    ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.moveTo(0, w.groundY + 0.5); ctx.lineTo(W, w.groundY + 0.5); ctx.stroke()

    // 障害物
    ctx.fillStyle = '#000'
    for (const o of w.obstacles) {
      const img = o.kind === 'tall' ? obsTallRef.current : obsShortRef.current
      if (img) {
        const ratio = img.width / img.height
        const drawH = o.h * CFG.OBS_IMG_SCALE
        const drawW = Math.max(o.w, drawH * ratio)
        const drawX = o.x + (o.w - drawW) / 2
        // 見た目を大きくしても地面基準で下端を揃える
        const drawY = o.y - (drawH - o.h)
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
      } else {
        ctx.fillRect(o.x, o.y, o.w, o.h)
      }
    }

    // キャラ
    const p = w.player
    const img = imgRef.current
    const drawW = CHAR_W, drawH = CHAR_H
    const drawX = Math.round(p.x - (drawW - p.w) / 2)
    const drawY = Math.round(p.y + p.h - drawH)
    if (img) {
      if (p.spin > 0) {
        const progress = 1 - p.spin / CFG.SPIN_MS
        const angle = progress * Math.PI * 2 // 1回転
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
    }
    else { ctx.fillStyle = '#000'; ctx.fillRect(drawX, drawY, drawW, drawH) }

    // HUD
    const sc = Math.floor(scoreRef.current)
    ctx.fillStyle = '#000'; ctx.font = '16px "Noto Sans JP", sans-serif'
    ctx.fillText(`SCORE ${sc.toString().padStart(5, '0')}`, 10, 18)
    const hsc = Math.max(high, sc)
    if (hsc) ctx.fillText(`HI ${hsc.toString().padStart(5, '0')}`, W - 100, 18)

    if (state === 'ready') { ctx.font = '16px "Noto Sans JP", sans-serif'; drawCenterText(ctx, W, H, '増田ラン - スペース/タップで開始') }
    else if (state === 'gameover') { ctx.font = '16px "Noto Sans JP", sans-serif'; drawCenterText(ctx, W, H, 'GAME OVER  -  スペース/タップで再開') }
  }

  // キャンバスリサイズ（横幅いっぱい + 高解像度対応）
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
      canvas.style.width = cssW + 'px'
      canvas.style.height = cssH + 'px'
      canvas.width = Math.round(CFG.BASE_W * scale)
      canvas.height = Math.round(CFG.BASE_H * scale)
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
    }
  }, [])

  // ループ
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(32, now - last); last = now
      update(dt, CFG.BASE_W)
      // 回転タイマーの更新（描画タイミングで減衰）
      const p = world.current.player
      if (p.spin > 0) p.spin = Math.max(0, p.spin - dt)
      // 論理座標を物理解像度へスケール
      ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, 0, 0)
      draw(ctx, CFG.BASE_W, CFG.BASE_H)
      reqRef.current = requestAnimationFrame(loop)
    }
    reqRef.current = requestAnimationFrame(loop)
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); reqRef.current = null }
  }, [state, high])

  // 初期ハイスコア
  const restartCooling = state === 'gameover' && restartReadyAt > 0
  const handlePrimaryAction = useCallback(() => {
    if (state === 'playing') {
      doJump()
    } else {
      startOrRestart()
    }
  }, [state, doJump, startOrRestart])

  return (
    <PageContainer>
      <Typography variant="h5" component="h1" gutterBottom>増田ラン</Typography>
      <Box ref={canvasWrapRef} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', width: '100%' }}>
        <canvas ref={canvasRef} width={CFG.BASE_W} height={CFG.BASE_H} tabIndex={0} style={{ width: '100%', height: 'auto', display: 'block', outline: 'none' }} />
      </Box>
      <Box sx={{ width: '100%', mt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disableRipple
          disabled={restartCooling}
          onPointerDown={(e) => {
            e.preventDefault()
            // pointerdown 後に click が続いても二重実行しないための抑止
            suppressClickRef.current = true
            window.setTimeout(() => { suppressClickRef.current = false }, 300)
            handlePrimaryAction()
          }}
          onClick={(e) => {
            e.preventDefault()
            if (suppressClickRef.current) {
              // 直前に pointerdown を処理済みの click は無視
              return
            }
            handlePrimaryAction()
          }}
        >
          {state === 'playing' ? 'ジャンプ' : state === 'ready' ? 'スタート' : 'リスタート'}
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        操作: スペース/↑でジャンプ（タップでジャンプ）。ゲームオーバー時はスペース/タップで再開。
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Link
          component={RouterLink}
          to="/games"
          color="inherit"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <ArrowBackIcon fontSize="small" />
          ゲーム一覧に戻る
        </Link>
      </Box>
    </PageContainer>
  )
}
