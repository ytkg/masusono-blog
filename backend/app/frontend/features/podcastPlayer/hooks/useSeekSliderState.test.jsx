import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useSeekSliderState } from "./useSeekSliderState"

afterEach(() => {
  vi.useRealTimers()
})

describe("useSeekSliderState", () => {
  it("ドラッグ中は間引きつきで preview seek し、確定時に最後の位置へ seek する", () => {
    vi.useFakeTimers()
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
    expect(onSeekTo).toHaveBeenCalledTimes(1)
    expect(onSeekTo).toHaveBeenNthCalledWith(1, 20)

    act(() => {
      vi.advanceTimersByTime(50)
      result.current.handleSeekChange(24)
      result.current.handleSeekChange(28)
    })

    expect(result.current.displayedCurrentTime).toBe(28)
    expect(result.current.sliderValue).toBe(28)
    expect(onSeekTo).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(onSeekTo).toHaveBeenCalledTimes(2)
    expect(onSeekTo).toHaveBeenNthCalledWith(2, 28)

    act(() => {
      result.current.handleSeekCommit(30)
    })

    expect(onSeekTo).toHaveBeenCalledTimes(3)
    expect(onSeekTo).toHaveBeenNthCalledWith(3, 30)
    expect(result.current.displayedCurrentTime).toBe(12)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onSeekTo).toHaveBeenCalledTimes(3)
  })

  it("seek 不可になったら pending preview を破棄してプレビューをリセットする", () => {
    vi.useFakeTimers()
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

    expect(onSeekTo).toHaveBeenCalledTimes(1)
    expect(onSeekTo).toHaveBeenNthCalledWith(1, 18)

    act(() => {
      vi.advanceTimersByTime(50)
      result.current.handleSeekChange(25)
    })

    rerender({ canSeek: false, currentTime: 5, duration: 30 })

    expect(result.current.displayedCurrentTime).toBe(5)
    expect(result.current.sliderValue).toBe(5)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onSeekTo).toHaveBeenCalledTimes(1)
  })

  it("指が止まったら preview 固定を解除して currentTime 追従に戻る", () => {
    vi.useFakeTimers()
    const onSeekTo = vi.fn()
    const { result, rerender } = renderHook(
      ({ currentTime }) =>
        useSeekSliderState({
          canSeek: true,
          currentTime,
          duration: 30,
          onSeekTo,
        }),
      {
        initialProps: { currentTime: 12 },
      },
    )

    act(() => {
      result.current.handleSeekChange(20)
    })

    expect(result.current.displayedCurrentTime).toBe(20)

    act(() => {
      vi.advanceTimersByTime(249)
    })

    rerender({ currentTime: 21 })

    expect(result.current.displayedCurrentTime).toBe(20)

    act(() => {
      vi.advanceTimersByTime(1)
    })

    rerender({ currentTime: 22 })

    expect(result.current.displayedCurrentTime).toBe(22)
    expect(result.current.sliderValue).toBe(22)
    expect(onSeekTo).toHaveBeenCalledTimes(1)
    expect(onSeekTo).toHaveBeenNthCalledWith(1, 20)

    act(() => {
      result.current.handleSeekCommit(20)
    })

    expect(onSeekTo).toHaveBeenCalledTimes(2)
    expect(onSeekTo).toHaveBeenNthCalledWith(2, 22)
  })
})
