import { CFG, HIT_H, HIT_W, HIGH_SCORE_KEY } from './constants'
import type { World } from './types'

export function createInitialWorld(): World {
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

export function rectsIntersect(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function getStoredHighScore() {
  if (typeof window === 'undefined') return 0
  return Number(window.localStorage.getItem(HIGH_SCORE_KEY) || 0)
}

export function persistHighScore(value: number) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(HIGH_SCORE_KEY, String(value))
}
