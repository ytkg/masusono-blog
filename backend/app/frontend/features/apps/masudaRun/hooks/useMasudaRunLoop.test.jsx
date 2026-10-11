import { renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { useMasudaRunLoop } from "./useMasudaRunLoop"

afterEach(() => vi.unstubAllGlobals())
it("does not observe a missing canvas wrapper and disconnects on unmount", () => {
  const observe = vi.fn()
  const disconnect = vi.fn()
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = observe
      disconnect = disconnect
    },
  )
  const refs = Object.fromEntries(
    [
      "scoreRef",
      "scoreDisplayRef",
      "restartReadyAtRef",
      "worldRef",
      "canvasRef",
      "canvasWrapRef",
      "scaleRef",
      "imgRef",
      "obsShortRef",
      "obsTallRef",
      "reqRef",
    ].map((key) => [key, { current: null }]),
  )
  const { unmount } = renderHook(() =>
    useMasudaRunLoop({
      state: "ready",
      high: 0,
      setHigh: vi.fn(),
      setScore: vi.fn(),
      setState: vi.fn(),
      setRestartReadyAt: vi.fn(),
      refs,
    }),
  )
  expect(observe).not.toHaveBeenCalled()
  unmount()
  expect(disconnect).toHaveBeenCalledOnce()
})
