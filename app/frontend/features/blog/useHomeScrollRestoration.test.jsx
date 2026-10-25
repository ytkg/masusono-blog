import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { router } from "@inertiajs/react"
import useHomeScrollRestoration from "./useHomeScrollRestoration"

vi.mock("@inertiajs/react", () => ({ router: { on: vi.fn() } }))

describe("useHomeScrollRestoration", () => {
  let frames
  let options
  let unsubscribe

  beforeEach(() => {
    frames = new Map()
    let nextId = 0
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback) => {
        frames.set(++nextId, callback)
        return nextId
      }),
    )
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn((id) => frames.delete(id)),
    )
    vi.spyOn(window, "scrollTo").mockImplementation(() => {})
    unsubscribe = vi.fn()
    router.on.mockReset().mockReturnValue(unsubscribe)
    options = { scrollY: 0, stateRef: { current: { articles: [{ id: "one" }], nextOffset: 10 } }, commit: vi.fn() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  function nextFrame() {
    const [id, callback] = frames.entries().next().value
    frames.delete(id)
    act(() => callback())
  }

  it("通常の遷移直前に最新の記事一覧とスクロール位置を保存し、離脱時に購読を解除する", () => {
    const { unmount } = renderHook(() => useHomeScrollRestoration(options))
    expect(router.on).toHaveBeenCalledWith("before", expect.any(Function))
    options.stateRef.current = { articles: [{ id: "two" }], nextOffset: 20 }
    vi.spyOn(window, "scrollY", "get").mockReturnValue(450)
    act(() => router.on.mock.calls[0][1]({ detail: { visit: {} } }))
    expect(options.commit).toHaveBeenCalledWith({ ...options.stateRef.current, scrollY: 450 })
    unmount()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it.each([{ prefetch: true }, { async: true }])("背景の取得 %j では保存しない", (visit) => {
    renderHook(() => useHomeScrollRestoration(options))
    act(() => router.on.mock.calls[0][1]({ detail: { visit } }))
    expect(options.commit).not.toHaveBeenCalled()
  })

  it("保存位置がなければ復元を予約しない", () => {
    renderHook(() => useHomeScrollRestoration(options))
    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it("二つの描画フレームを待って保存位置へ戻す", () => {
    renderHook(() => useHomeScrollRestoration({ ...options, scrollY: 640 }))
    nextFrame()
    expect(window.scrollTo).not.toHaveBeenCalled()
    nextFrame()
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 640 })
  })

  it.each([0, 1])("復元前に離脱したら予約を取り消す（経過フレーム %i）", (elapsed) => {
    const { unmount } = renderHook(() => useHomeScrollRestoration({ ...options, scrollY: 640 }))
    if (elapsed) nextFrame()
    unmount()
    expect(frames.size).toBe(0)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it("復元待ちの位置が変わったら古い予約を置き換える", () => {
    const { rerender } = renderHook(({ scrollY }) => useHomeScrollRestoration({ ...options, scrollY }), {
      initialProps: { scrollY: 100 },
    })
    nextFrame()
    rerender({ scrollY: 900 })
    expect(frames.size).toBe(1)
    nextFrame()
    nextFrame()
    expect(window.scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 900 })
  })
})
