import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useAdminMedia from "./useAdminMedia"

const response = (media, hasMore = true) => ({
  ok: true,
  status: 200,
  json: async () => ({ media, total_count: 2, page: 1, has_more: hasMore, next_token: "next" }),
})
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

afterEach(() => vi.unstubAllGlobals())

describe("useAdminMedia", () => {
  it("検索変更で追加取得を中断し、古い応答を無視する", async () => {
    const oldMore = deferred()
    const newMore = deferred()
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response([{ id: "old" }]))
      .mockReturnValueOnce(oldMore.promise)
      .mockResolvedValueOnce(response([{ id: "new" }]))
      .mockReturnValueOnce(newMore.promise)
    vi.stubGlobal("fetch", fetch)
    const onUnauthorized = vi.fn()
    const { result, rerender } = renderHook(({ query }) => useAdminMedia({ query, refreshKey: 0, onUnauthorized }), {
      initialProps: { query: "old" },
    })
    await waitFor(() => expect(result.current.items).toEqual([{ id: "old" }]))
    act(() => {
      result.current.loadMore()
      result.current.loadMore()
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    const oldSignal = fetch.mock.calls[1][1].signal
    rerender({ query: "new" })
    expect(oldSignal.aborted).toBe(true)
    await waitFor(() => expect(result.current.items).toEqual([{ id: "new" }]))
    act(() => {
      result.current.loadMore()
    })
    await act(async () => {
      oldMore.resolve(response([{ id: "stale" }]))
    })
    expect(result.current.items).toEqual([{ id: "new" }])
    expect(result.current.loadingMore).toBe(true)
    await act(async () => {
      newMore.resolve(response([{ id: "next" }], false))
    })
    expect(result.current.items).toEqual([{ id: "new" }, { id: "next" }])
    expect(result.current.loadingMore).toBe(false)
  })

  it("追加取得の401で認証切れを通知し、アンマウントで通信を中断する", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response([{ id: "first" }]))
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    vi.stubGlobal("fetch", fetch)
    const onUnauthorized = vi.fn()
    const { result, unmount } = renderHook(() => useAdminMedia({ query: "", refreshKey: 0, onUnauthorized }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.loadMore()
    })
    expect(onUnauthorized).toHaveBeenCalledOnce()
    const signal = fetch.mock.calls[0][1].signal
    unmount()
    expect(signal.aborted).toBe(true)
  })
  it("追加取得に失敗しても一覧と取得位置を保ち、同じページを再試行する", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response([{ id: "first" }]))
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(response([{ id: "second" }], false))
    vi.stubGlobal("fetch", fetch)
    const onUnauthorized = vi.fn()
    const { result } = renderHook(() => useAdminMedia({ query: "", refreshKey: 0, onUnauthorized }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.loadMore()
    })
    expect(result.current.items).toEqual([{ id: "first" }])
    expect(result.current.error).toContain("メディアを取得できませんでした")
    expect(result.current.loadingMore).toBe(false)
    await act(async () => {
      await result.current.loadMore()
    })
    expect(fetch.mock.calls[2][0]).toBe(fetch.mock.calls[1][0])
    expect(result.current.items).toEqual([{ id: "first" }, { id: "second" }])
    expect(result.current.error).toBeNull()
    await act(async () => {
      await result.current.loadMore()
    })
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it("検索変更後に古い追加取得が401で失敗しても新しい認証状態を変更しない", async () => {
    let rejectOld
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response([{ id: "old" }]))
      .mockReturnValueOnce(
        new Promise((_, reject) => {
          rejectOld = reject
        }),
      )
      .mockResolvedValueOnce(response([{ id: "new" }], false))
    vi.stubGlobal("fetch", fetch)
    const onUnauthorized = vi.fn()
    const { result, rerender } = renderHook(({ query }) => useAdminMedia({ query, refreshKey: 0, onUnauthorized }), {
      initialProps: { query: "old" },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.loadMore()
    })
    rerender({ query: "new" })
    await waitFor(() => expect(result.current.items).toEqual([{ id: "new" }]))
    await act(async () => {
      rejectOld({ status: 401 })
    })
    expect(onUnauthorized).not.toHaveBeenCalled()
    expect(result.current.items).toEqual([{ id: "new" }])
    expect(result.current.error).toBeNull()
  })

  it("初回取得の通信失敗を表示し、再取得キーの変更で回復する", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(response([], false))
    vi.stubGlobal("fetch", fetch)
    const onUnauthorized = vi.fn()
    const { result, rerender } = renderHook(
      ({ refreshKey }) => useAdminMedia({ query: "", refreshKey, onUnauthorized }),
      {
        initialProps: { refreshKey: 0 },
      },
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toContain("メディアを取得できませんでした")
    rerender({ refreshKey: 1 })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
