import { describe, expect, it, vi } from "vitest"
import { CFG, HIGH_SCORE_KEY, HIT_H, HIT_W } from "./constants"
import { createInitialWorld, getStoredHighScore, persistHighScore, rectsIntersect } from "./world"

describe("world", () => {
  it("初期 world を組み立てる", () => {
    const world = createInitialWorld()
    const groundY = Math.round(CFG.BASE_H * CFG.GROUND_RATIO)

    expect(world).toMatchObject({
      t: 0,
      speed: CFG.SPEED_BASE,
      groundY,
      gravity: CFG.GRAVITY,
      obstacles: [],
      clouds: [],
    })
    expect(world.player).toEqual({
      x: 60,
      y: groundY - HIT_H,
      vy: 0,
      w: HIT_W,
      h: HIT_H,
      onGround: true,
      jumps: 0,
      spin: 0,
    })
  })

  it("矩形当たり判定を行う", () => {
    expect(rectsIntersect(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true)
    expect(rectsIntersect(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false)
  })

  it("ハイスコアを localStorage に保存・取得する", () => {
    localStorage.removeItem(HIGH_SCORE_KEY)

    expect(getStoredHighScore()).toBe(0)

    persistHighScore(3210)

    expect(localStorage.getItem(HIGH_SCORE_KEY)).toBe("3210")
    expect(getStoredHighScore()).toBe(3210)
  })
})

it.each(["invalid", "NaN", "Infinity", "-1"])("ignores a corrupt stored score: %s", (value) => {
  localStorage.setItem(HIGH_SCORE_KEY, value)
  expect(getStoredHighScore()).toBe(0)
  localStorage.removeItem(HIGH_SCORE_KEY)
})
it("continues when storage reads or writes are denied", () => {
  const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("denied")
  })
  const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("denied")
  })
  expect(getStoredHighScore()).toBe(0)
  expect(() => persistHighScore(10)).not.toThrow()
  get.mockRestore()
  set.mockRestore()
})
