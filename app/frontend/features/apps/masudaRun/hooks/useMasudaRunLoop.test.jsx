import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { createInitialWorld, CFG } from "../lib"
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
