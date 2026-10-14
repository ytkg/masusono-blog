import { renderHook } from "@testing-library/react"
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

    renderHook(() =>
      useMasudaRunInput({
        state: "playing",
        canvasRef: { current: canvas },
        startOrRestart,
        doJump,
      }),
    )

    expect(attachKeyboardHandlers).toHaveBeenCalledWith("playing", startOrRestart, doJump)
    expect(attachPointerHandler).toHaveBeenCalledWith(canvas, "playing", startOrRestart, doJump)
  })
})
