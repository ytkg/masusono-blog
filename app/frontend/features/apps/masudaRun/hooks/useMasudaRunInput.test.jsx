import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { attachKeyboardHandlers, attachPointerHandler } from "../lib"
import { useMasudaRunInput } from "./useMasudaRunInput"

vi.mock("../lib", () => ({
  attachKeyboardHandlers: vi.fn(),
  attachPointerHandler: vi.fn(),
}))

describe("useMasudaRunInput", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("キーボードとポインターのハンドラを登録する", () => {
    const canvas = {}
    const startOrRestart = vi.fn()
    const doJump = vi.fn()
    const suppressClickRef = { current: false }

    renderHook(() =>
      useMasudaRunInput({
        state: "playing",
        canvasRef: { current: canvas },
        startOrRestart,
        doJump,
        suppressClickRef,
      }),
    )

    expect(attachKeyboardHandlers).toHaveBeenCalledWith("playing", startOrRestart, doJump)
    expect(attachPointerHandler).toHaveBeenCalledWith(canvas, "playing", startOrRestart, doJump)
  })

  it("primary pointer/click の抑制フラグを制御する", () => {
    const suppressClickRef = { current: false }
    const { result } = renderHook(() =>
      useMasudaRunInput({
        state: "ready",
        canvasRef: { current: null },
        startOrRestart: vi.fn(),
        doJump: vi.fn(),
        suppressClickRef,
      }),
    )

    act(() => {
      result.current.onPrimaryPointerDown()
    })

    expect(suppressClickRef.current).toBe(true)
    expect(result.current.onPrimaryClick()).toBe(false)

    vi.advanceTimersByTime(300)

    expect(suppressClickRef.current).toBe(false)
    expect(result.current.onPrimaryClick()).toBe(true)
  })
})
