import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useMiniPlayerDismissal } from "./useMiniPlayerDismissal"

describe("useMiniPlayerDismissal", () => {
  it("dismiss で pause を呼び出し、非表示状態にする", () => {
    const pause = vi.fn()
    const { result } = renderHook(() =>
      useMiniPlayerDismissal({
        hasCurrentEpisode: true,
        isPlaying: false,
        pause,
      }),
    )

    expect(result.current.isDismissed).toBe(false)

    act(() => {
      result.current.dismiss()
    })

    expect(pause).toHaveBeenCalledTimes(1)
    expect(result.current.isDismissed).toBe(true)
  })

  it("再生開始で非表示状態を解除する", () => {
    const pause = vi.fn()
    const { result, rerender } = renderHook(
      ({ isPlaying }) =>
        useMiniPlayerDismissal({
          hasCurrentEpisode: true,
          isPlaying,
          pause,
        }),
      { initialProps: { isPlaying: false } },
    )

    act(() => {
      result.current.dismiss()
    })
    expect(result.current.isDismissed).toBe(true)

    rerender({ isPlaying: true })
    expect(result.current.isDismissed).toBe(false)
  })

  it("エピソードがなくなったら非表示状態を解除する", () => {
    const pause = vi.fn()
    const { result, rerender } = renderHook(
      ({ hasCurrentEpisode }) =>
        useMiniPlayerDismissal({
          hasCurrentEpisode,
          isPlaying: false,
          pause,
        }),
      { initialProps: { hasCurrentEpisode: true } },
    )

    act(() => {
      result.current.dismiss()
    })
    expect(result.current.isDismissed).toBe(true)

    rerender({ hasCurrentEpisode: false })
    expect(result.current.isDismissed).toBe(false)
  })
})
