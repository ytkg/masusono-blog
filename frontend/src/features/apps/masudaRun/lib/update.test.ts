import { describe, expect, it } from "vitest"
import {
  CFG,
  HIT_H,
  createInitialWorld,
  updateClouds,
  updateObstacles,
  updatePlayer,
  updateScoreDisplay,
  updateSpeed,
} from "@/features/apps/masudaRun/lib"

describe("updateSpeed", () => {
  it("時間と速度を更新する", () => {
    const w = createInitialWorld()
    updateSpeed(w, 1000)
    const expectedSpeed = CFG.SPEED_BASE + Math.min(CFG.SPEED_GAIN_MAX, 1000 * CFG.SPEED_GAIN_RATE)
    expect(w.t).toBe(1000)
    expect(w.speed).toBeCloseTo(expectedSpeed)
  })
})

describe("updatePlayer", () => {
  it("地面に着地したら位置と状態を補正する", () => {
    const w = createInitialWorld()
    w.player.y = w.groundY + 10
    w.player.vy = 5
    w.player.onGround = false
    w.player.jumps = 1
    w.player.spin = 100

    updatePlayer(w)

    expect(w.player.y).toBe(w.groundY - HIT_H)
    expect(w.player.vy).toBe(0)
    expect(w.player.onGround).toBe(true)
    expect(w.player.jumps).toBe(0)
    expect(w.player.spin).toBe(0)
  })
})

describe("updateObstacles", () => {
  it("障害物を移動させ、画面外のものを除去する", () => {
    const w = createInitialWorld()
    w.speed = 5
    w.obstacles = [
      { x: 0, y: 0, w: 10, h: 10, kind: "short" },
      { x: -12, y: 0, w: 1, h: 10, kind: "tall" },
    ]

    updateObstacles(w)

    expect(w.obstacles).toHaveLength(1)
    expect(w.obstacles[0]?.x).toBe(-5)
  })
})

describe("updateClouds", () => {
  it("雲を移動させ、画面外のものを除去する", () => {
    const w = createInitialWorld()
    w.speed = 0
    w.clouds = [
      { x: -19, y: 0, w: 1, h: 1, speed: 0, alpha: 1 },
      { x: -25, y: 0, w: 4, h: 1, speed: 0, alpha: 1 },
    ]

    updateClouds(w)

    expect(w.clouds).toHaveLength(1)
    expect(w.clouds[0]?.x).toBe(-19)
  })
})

describe("updateScoreDisplay", () => {
  it("表示スコアが変化したときにのみ更新する", () => {
    const scoreRef = { current: 9.8 }
    const scoreDisplayRef = { current: 8 }
    const updates: number[] = []

    updateScoreDisplay(scoreRef, scoreDisplayRef, (value) => updates.push(value))
    updateScoreDisplay(scoreRef, scoreDisplayRef, (value) => updates.push(value))

    expect(updates).toEqual([9])
  })
})
