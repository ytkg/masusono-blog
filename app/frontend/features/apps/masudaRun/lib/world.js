import { CFG, HIT_H, HIT_W, HIGH_SCORE_KEY } from "./constants"

const INITIAL_PLAYER_X = 60

export function createInitialWorld() {
  const groundY = Math.round(CFG.BASE_H * CFG.GROUND_RATIO)
  return {
    t: 0,
    speed: CFG.SPEED_BASE,
    groundY,
    player: { x: INITIAL_PLAYER_X, y: groundY - HIT_H, vy: 0, w: HIT_W, h: HIT_H, onGround: true, jumps: 0, spin: 0 },
    gravity: CFG.GRAVITY,
    obstacles: [],
    nextSpawn: 0,
    clouds: [],
    nextCloud: 0,
  }
}

export function rectsIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function getStoredHighScore() {
  if (typeof window === "undefined") return 0
  try {
    const score = Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0)
    return Number.isFinite(score) && score >= 0 ? score : 0
  } catch {
    return 0
  }
}

export function persistHighScore(value) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(value))
  } catch {
    // A storage restriction must not interrupt the game-over transition.
  }
}
