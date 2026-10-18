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

  it("操作不可の間は入力を登録せず、有効化後の入力も無効化時に解除する", () => {
    const keyboardCleanup = vi.fn()
    const pointerCleanup = vi.fn()
    attachKeyboardHandlers.mockReturnValue(keyboardCleanup)
    attachPointerHandler.mockReturnValue(pointerCleanup)
    const options = { state: "playing", canvasRef: { current: {} }, startOrRestart: vi.fn(), doJump: vi.fn() }
    const { rerender } = renderHook(({ active }) => useMasudaRunInput({ ...options, active }), {
      initialProps: { active: false },
    })
    expect(attachKeyboardHandlers).not.toHaveBeenCalled()
    expect(attachPointerHandler).not.toHaveBeenCalled()
    rerender({ active: true })
    expect(attachKeyboardHandlers).toHaveBeenCalledOnce()
    expect(attachPointerHandler).toHaveBeenCalledOnce()
    rerender({ active: false })
    expect(keyboardCleanup).toHaveBeenCalledOnce()
    expect(pointerCleanup).toHaveBeenCalledOnce()
  })
})
