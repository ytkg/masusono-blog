import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useMiniPlayerFlipAnimation } from "./useMiniPlayerFlipAnimation"

function buildElement(rects) {
  return {
    getBoundingClientRect: vi.fn()
      .mockReturnValueOnce(rects[0])
      .mockReturnValueOnce(rects[1]),
    animate: vi.fn(),
  }
}

describe("useMiniPlayerFlipAnimation", () => {
  it("collapse 時に FLIP アニメーションを実行する", () => {
    const collapse = vi.fn()
    const element = buildElement([
      { left: 100, top: 200, width: 300, height: 120 },
      { left: 220, top: 320, width: 80, height: 80 },
    ])
    const playerRef = { current: element }
    const { result, rerender } = renderHook(
      ({ isCollapsed }) =>
        useMiniPlayerFlipAnimation({
          isCollapsed,
          playerRef,
          collapse,
          expand: vi.fn(),
        }),
      {
        initialProps: { isCollapsed: false },
      },
    )

    act(() => {
      result.current.collapseWithAnimation()
    })
    rerender({ isCollapsed: true })

    expect(collapse).toHaveBeenCalledTimes(1)
    expect(element.animate).toHaveBeenCalledTimes(1)
    expect(result.current.animationSx.animation).toContain("mini-player-collapse")
  })

  it("reduced motion では animate を呼ばない", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    const element = buildElement([
      { left: 10, top: 20, width: 100, height: 60 },
      { left: 20, top: 30, width: 80, height: 50 },
    ])
    const playerRef = { current: element }
    const { result, rerender } = renderHook(
      ({ isCollapsed }) =>
        useMiniPlayerFlipAnimation({
          isCollapsed,
          playerRef,
          collapse: vi.fn(),
          expand: vi.fn(),
        }),
      {
        initialProps: { isCollapsed: false },
      },
    )

    act(() => {
      result.current.collapseWithAnimation()
    })
    rerender({ isCollapsed: true })

    expect(element.animate).not.toHaveBeenCalled()
  })
})
