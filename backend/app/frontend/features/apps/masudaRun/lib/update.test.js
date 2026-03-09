import { afterEach, describe, expect, it, vi } from "vitest"
import { CFG, HIT_H } from "./constants"
import {
  maybeSpawnCloud,
  maybeSpawnObstacle,
  updateClouds,
  updateObstacles,
  updatePlayer,
  updateScoreDisplay,
  updateSpeed,
} from "./update"

describe("updateSpeed", () => {
  it("経過時間と速度を更新する", () => {
    const world = { t: 0, speed: CFG.SPEED_BASE }

    updateSpeed(world, 1000)

    expect(world.t).toBe(1000)
    expect(world.speed).toBeGreaterThan(CFG.SPEED_BASE)
  })
})

describe("updatePlayer", () => {
  it("地面に着地したら状態をリセットする", () => {
    const world = {
      gravity: 1,
      groundY: 200,
      player: { y: 190, vy: 5, h: 10, onGround: false, jumps: 2, spin: 100 },
    }

    updatePlayer(world)

    expect(world.player.y).toBe(200 - HIT_H)
    expect(world.player.vy).toBe(0)
    expect(world.player.onGround).toBe(true)
    expect(world.player.jumps).toBe(0)
    expect(world.player.spin).toBe(0)
  })
})

describe("maybeSpawnObstacle", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("条件を満たすと障害物を追加する", () => {
    const random = vi.spyOn(Math, "random")
    random.mockReturnValueOnce(0.1).mockReturnValueOnce(0.5).mockReturnValueOnce(0.25).mockReturnValueOnce(0.75)
    const world = {
      nextSpawn: 0,
      groundY: 200,
      obstacles: [],
      t: 10,
    }

    maybeSpawnObstacle(world, 900, 16)

    expect(world.obstacles).toHaveLength(1)
    expect(world.obstacles[0]).toMatchObject({
      x: 920,
      y: 146,
      h: CFG.TALL_H,
      kind: "tall",
    })
    expect(world.nextSpawn).toBeGreaterThan(0)
  })
})

describe("updateObstacles", () => {
  it("画面外の障害物を除去する", () => {
    const world = {
      speed: 10,
      obstacles: [
        { x: 20, w: 10 },
        { x: -30, w: 10 },
      ],
    }

    updateObstacles(world)

    expect(world.obstacles).toEqual([{ x: 10, w: 10 }])
  })
})

describe("maybeSpawnCloud", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("雲を追加する", () => {
    const random = vi.spyOn(Math, "random")
    random
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.75)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.6)
    const world = {
      nextCloud: 0,
      groundY: 220,
      clouds: [],
    }

    maybeSpawnCloud(world, 900, 16)

    expect(world.clouds).toHaveLength(1)
    expect(world.clouds[0].x).toBe(920)
    expect(world.nextCloud).toBeGreaterThan(0)
  })
})

describe("updateClouds", () => {
  it("速度に応じて雲を進め、画面外を除去する", () => {
    const world = {
      speed: 20,
      clouds: [
        { x: 30, w: 15, speed: 1 },
        { x: -30, w: 5, speed: 1 },
      ],
    }

    updateClouds(world)

    expect(world.clouds).toEqual([{ x: 22, w: 15, speed: 1 }])
  })
})

describe("updateScoreDisplay", () => {
  it("整数値が変わったときだけ state を更新する", () => {
    const scoreRef = { current: 12.9 }
    const scoreDisplayRef = { current: 11 }
    const setScore = vi.fn()

    updateScoreDisplay(scoreRef, scoreDisplayRef, setScore)
    updateScoreDisplay(scoreRef, scoreDisplayRef, setScore)

    expect(scoreDisplayRef.current).toBe(12)
    expect(setScore).toHaveBeenCalledTimes(1)
    expect(setScore).toHaveBeenCalledWith(12)
  })
})
