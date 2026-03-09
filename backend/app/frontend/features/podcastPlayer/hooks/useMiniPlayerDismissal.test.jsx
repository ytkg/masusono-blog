import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useMiniPlayerDismissal } from "./useMiniPlayerDismissal"

describe("useMiniPlayerDismissal", () => {
  it("dismiss で pause して dismissed にする", () => {
    const pause = vi.fn()
    const { result } = renderHook(() =>
      useMiniPlayerDismissal({
        hasCurrentEpisode: true,
        isPlaying: false,
        pause,
      }),
    )

    act(() => {
      result.current.dismiss()
    })

    expect(pause).toHaveBeenCalledTimes(1)
    expect(result.current.isDismissed).toBe(true)
  })

  it("再生再開かエピソード消失で dismissed を解除する", () => {
    const { result, rerender } = renderHook(
      ({ hasCurrentEpisode, isPlaying }) =>
        useMiniPlayerDismissal({
          hasCurrentEpisode,
          isPlaying,
          pause: vi.fn(),
        }),
      {
        initialProps: { hasCurrentEpisode: true, isPlaying: false },
      },
    )

    act(() => {
      result.current.dismiss()
    })
    expect(result.current.isDismissed).toBe(true)

    rerender({ hasCurrentEpisode: true, isPlaying: true })
    expect(result.current.isDismissed).toBe(false)

    act(() => {
      result.current.dismiss()
    })
    rerender({ hasCurrentEpisode: false, isPlaying: false })
    expect(result.current.isDismissed).toBe(false)
  })
})
