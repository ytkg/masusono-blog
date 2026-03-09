import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useSeekSliderState } from "./useSeekSliderState"

describe("useSeekSliderState", () => {
  it("プレビュー値を表示しつつ seek を同期する", () => {
    const onSeekTo = vi.fn()

    const { result } = renderHook(() =>
      useSeekSliderState({
        canSeek: true,
        currentTime: 12,
        duration: 30,
        onSeekTo,
      }),
    )

    expect(result.current.displayedCurrentTime).toBe(12)
    expect(result.current.sliderValue).toBe(12)

    act(() => {
      result.current.handleSeekChange(20)
    })

    expect(result.current.displayedCurrentTime).toBe(20)
    expect(result.current.sliderValue).toBe(20)
    expect(onSeekTo).toHaveBeenCalledWith(20)

    act(() => {
      result.current.handleSeekChange(20.005)
    })

    expect(onSeekTo).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.handleSeekCommit()
    })

    expect(result.current.displayedCurrentTime).toBe(12)
  })

  it("seek 不可になったらプレビューをリセットする", () => {
    const onSeekTo = vi.fn()
    const { result, rerender } = renderHook(
      ({ canSeek, currentTime, duration }) =>
        useSeekSliderState({
          canSeek,
          currentTime,
          duration,
          onSeekTo,
        }),
      {
        initialProps: { canSeek: true, currentTime: 40, duration: 30 },
      },
    )

    expect(result.current.sliderValue).toBe(30)

    act(() => {
      result.current.handleSeekChange(18)
    })

    rerender({ canSeek: false, currentTime: 5, duration: 30 })

    expect(result.current.displayedCurrentTime).toBe(5)
    expect(result.current.sliderValue).toBe(5)
  })
})
