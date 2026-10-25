import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { createInitialWorld, CFG, HIGH_SCORE_KEY, RESTART_DELAY_MS } from "../lib"
import { useMasudaRunLoop } from "./useMasudaRunLoop"

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib")
  const noop = () => {}
  return {
    ...actual,
    drawSky: noop,
    drawGround: noop,
    drawObstacles: noop,
    drawPlayer: noop,
    drawStateText: noop,
    resizeCanvas: noop,
  }
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it("30/60/120Hzで同じ時間後のジャンプ・障害物移動・スコアが一致する", () => {
  vi.spyOn(performance, "now").mockReturnValue(0)
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  )
  const snapshots = [30, 60, 120].map((hz) => {
    let frame
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback) => {
        frame = callback
        return 1
      }),
    )
    vi.stubGlobal("cancelAnimationFrame", vi.fn())
    const world = createInitialWorld()
    world.nextSpawn = Infinity
    world.nextCloud = Infinity
    world.player.vy = CFG.JUMP_VY
    world.player.jumps = 1
    world.obstacles = [{ x: 1000, y: world.groundY - 10, w: 10, h: 10 }]
    const refs = Object.fromEntries(
      ["scoreRef", "scoreDisplayRef", "restartReadyAtRef", "scaleRef"].map((key) => [key, { current: 0 }]),
    )
    Object.assign(refs, {
      worldRef: { current: world },
      canvasRef: { current: { getContext: () => ({ setTransform() {} }) } },
      canvasWrapRef: { current: {} },
      imgRef: {},
      obsShortRef: {},
      obsTallRef: {},
      reqRef: {},
    })
    const { unmount } = renderHook(() =>
      useMasudaRunLoop({
        state: "playing",
        high: 0,
        setHigh: vi.fn(),
        setScore: vi.fn(),
        setState: vi.fn(),
        setRestartReadyAt: vi.fn(),
        refs,
      }),
    )
    for (let index = 1; index <= hz / 2; index++) act(() => frame((index * 1000) / hz))
    const snapshot = [world.t, world.player.y, world.obstacles[0].x, refs.scoreRef.current]
    unmount()
    return snapshot
  })
  expect(snapshots[0][0]).toBeCloseTo(500)
  for (const snapshot of snapshots.slice(1))
    snapshot.forEach((value, index) => expect(value).toBeCloseTo(snapshots[0][index], 6))
})

it("操作不可の間はRAFを停止し、再開時に待機時間を物理計算へ加えない", () => {
  let now = 0
  vi.spyOn(performance, "now").mockImplementation(() => now)
  const frames = new Map()
  let nextId = 0
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback) => {
      frames.set(++nextId, callback)
      return nextId
    }),
  )
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id) => frames.delete(id)),
  )
  const world = createInitialWorld()
  world.nextSpawn = Infinity
  world.nextCloud = Infinity
  const refs = Object.fromEntries(
    ["scoreRef", "scoreDisplayRef", "restartReadyAtRef", "scaleRef"].map((key) => [key, { current: 0 }]),
  )
  Object.assign(refs, {
    worldRef: { current: world },
    canvasRef: { current: { getContext: () => ({ setTransform() {} }) } },
    canvasWrapRef: { current: document.createElement("div") },
    imgRef: {},
    obsShortRef: {},
    obsTallRef: {},
    reqRef: {},
  })
  const options = {
    state: "playing",
    high: 0,
    setHigh: vi.fn(),
    setScore: vi.fn(),
    setState: vi.fn(),
    setRestartReadyAt: vi.fn(),
    refs,
  }
  const { rerender, unmount } = renderHook(({ active }) => useMasudaRunLoop({ ...options, active }), {
    initialProps: { active: false },
  })
  expect(frames.size).toBe(0)
  rerender({ active: true })
  const step = () => {
    const [id, callback] = frames.entries().next().value
    frames.delete(id)
    now += 1000 / 60
    act(() => callback(now))
  }
  step()
  expect(world.t).toBeCloseTo(1000 / 60)
  rerender({ active: false })
  expect(frames.size).toBe(0)
  now += 10000
  rerender({ active: true })
  step()
  expect(world.t).toBeCloseTo(2000 / 60)
  unmount()
  expect(frames.size).toBe(0)
})

it.each([0, 200])("衝突で終了し、既存ベスト %i を超えた場合だけ記録する", (high) => {
  vi.spyOn(performance, "now").mockReturnValue(0)
  vi.stubGlobal("ResizeObserver", undefined)
  let frame
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback) => {
      frame = callback
      return 1
    }),
  )
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
  const saveScore = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {})
  const world = createInitialWorld()
  world.nextSpawn = Infinity
  world.nextCloud = Infinity
  world.player.y -= 10
  world.player.onGround = false
  world.player.spin = 100
  world.obstacles = [{ ...world.player }]
  const refs = {
    scoreRef: { current: 123.9 },
    scoreDisplayRef: { current: 123 },
    restartReadyAtRef: { current: 0 },
    scaleRef: { current: 1 },
    worldRef: { current: world },
    canvasRef: { current: { getContext: () => ({ setTransform() {} }) } },
    canvasWrapRef: { current: document.createElement("div") },
    imgRef: {},
    obsShortRef: {},
    obsTallRef: {},
    reqRef: {},
  }
  const options = {
    state: "playing",
    high,
    setHigh: vi.fn(),
    setScore: vi.fn(),
    setState: vi.fn(),
    setRestartReadyAt: vi.fn(),
    refs,
  }
  const { unmount } = renderHook(() => useMasudaRunLoop(options))
  act(() => frame(1000 / 60))
  expect(options.setState).toHaveBeenCalledExactlyOnceWith("gameover")
  expect(options.setRestartReadyAt).toHaveBeenCalledWith(RESTART_DELAY_MS)
  expect(refs.restartReadyAtRef.current).toBe(RESTART_DELAY_MS)
  expect(refs.scoreRef.current).toBe(123.9)
  expect(world.player.spin).toBeCloseTo(100 - 1000 / 60)
  if (high === 0) {
    expect(options.setHigh).toHaveBeenCalledExactlyOnceWith(123)
    expect(saveScore).toHaveBeenCalledExactlyOnceWith(HIGH_SCORE_KEY, "123")
  } else {
    expect(options.setHigh).not.toHaveBeenCalled()
    expect(saveScore).not.toHaveBeenCalled()
  }
  unmount()
  expect(refs.reqRef.current).toBeNull()
})
