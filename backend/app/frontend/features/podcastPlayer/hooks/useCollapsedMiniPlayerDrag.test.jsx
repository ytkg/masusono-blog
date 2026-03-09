import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useCollapsedMiniPlayerDrag } from "./useCollapsedMiniPlayerDrag"

describe("useCollapsedMiniPlayerDrag", () => {
  it("ドラッグ位置を更新し、ドラッグ直後は expand を抑止する", () => {
    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    const player = {
      getBoundingClientRect: vi.fn().mockReturnValue({ left: 100, top: 100, width: 72, height: 72 }),
    }
    result.current.playerRef.current = player
    const preventDefault = vi.fn()
    const setPointerCapture = vi.fn()

    act(() => {
      result.current.startDrag({
        pointerType: "touch",
        button: 0,
        pointerId: 1,
        clientX: 120,
        clientY: 120,
        currentTarget: { setPointerCapture },
        preventDefault,
      })
    })

    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 1, clientX: 150, clientY: 155 }))
    })

    expect(result.current.collapsedPosition).toEqual({ left: 130, top: 135 })
    expect(result.current.containerStyle).toEqual({
      top: "135px",
      left: "130px",
      right: "auto",
      bottom: "auto",
    })
    expect(result.current.shouldExpandAfterClick()).toBe(false)
    expect(result.current.shouldExpandAfterClick()).toBe(true)
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(setPointerCapture).toHaveBeenCalledWith(1)
  })

  it("resetPosition でカスタム位置を消す", () => {
    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    result.current.playerRef.current = {
      getBoundingClientRect: vi.fn().mockReturnValue({ left: 100, top: 100, width: 72, height: 72 }),
    }

    act(() => {
      result.current.startDrag({
        pointerType: "touch",
        button: 0,
        pointerId: 1,
        clientX: 120,
        clientY: 120,
        currentTarget: { setPointerCapture: vi.fn() },
        preventDefault: vi.fn(),
      })
    })

    act(() => {
      result.current.resetPosition()
    })

    expect(result.current.collapsedPosition).toBeNull()
    expect(result.current.containerStyle).toBeUndefined()
  })
})
