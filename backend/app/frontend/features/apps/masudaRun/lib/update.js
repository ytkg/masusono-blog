import { CFG, HIT_H } from "./constants"

export const updateSpeed = (w, dt) => {
  w.t += dt
  w.speed = CFG.SPEED_BASE + Math.min(CFG.SPEED_GAIN_MAX, w.t * CFG.SPEED_GAIN_RATE)
}

export const updatePlayer = (w) => {
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
}

export const maybeSpawnObstacle = (w, W, dt) => {
  w.nextSpawn -= dt
  if (w.nextSpawn > 0) return
  const tall = Math.random() < CFG.TALL_PROB
  const h = tall ? CFG.TALL_H : CFG.SHORT_H_MIN + Math.random() * CFG.SHORT_H_RANGE
  const y = w.groundY - h
  const kind = tall ? "tall" : "short"
  const obs = {
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

export const updateObstacles = (w) => {
  for (const o of w.obstacles) o.x -= w.speed
  w.obstacles = w.obstacles.filter((o) => o.x + o.w > -10)
}

export const maybeSpawnCloud = (w, W, dt) => {
  w.nextCloud -= dt
  if (w.nextCloud > 0) return
  const y = Math.random() * Math.max(20, w.groundY - 160)
  const h = 18 + Math.random() * 22
  const wCloud = h * (1.8 + Math.random() * 0.8)
  const speed = CFG.CLOUD_SPEED_MIN + Math.random() * (CFG.CLOUD_SPEED_MAX - CFG.CLOUD_SPEED_MIN)
  const alpha = 0.35 + Math.random() * 0.25
  const shape = {
    leftPuffX: 0.28 + Math.random() * 0.08,
    leftPuffY: 0.38 + Math.random() * 0.16,
    centerPuffY: 0.06 + Math.random() * 0.14,
    rightPuffY: 0.06 + Math.random() * 0.16,
  }
  w.clouds.push({ x: W + 20, y, w: wCloud, h, speed, alpha, shape })
  w.nextCloud = CFG.CLOUD_SPAWN_BASE + Math.random() * CFG.CLOUD_SPAWN_RAND
}

export const updateClouds = (w) => {
  for (const c of w.clouds) c.x -= w.speed * 0.35 + c.speed
  w.clouds = w.clouds.filter((c) => c.x + c.w > -20)
}

export const updateScoreDisplay = (scoreRef, scoreDisplayRef, setScore) => {
  const sc = Math.floor(scoreRef.current)
  if (scoreDisplayRef.current !== sc) {
    scoreDisplayRef.current = sc
    setScore(sc)
  }
}
