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
})
