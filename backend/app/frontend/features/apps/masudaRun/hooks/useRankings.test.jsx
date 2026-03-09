import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import useRankings from "./useRankings"

vi.mock("swr", () => ({
  default: vi.fn(),
}))

describe("useRankings", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("SWR の読み込み状態を整形する", () => {
    const mutate = vi.fn()
    vi.mocked(useSWR).mockReturnValue({
      data: [{ rank: 1, userId: "u1" }],
      error: null,
      isLoading: true,
      mutate,
    })

    const { result } = renderHook(() => useRankings(true))

    expect(useSWR).toHaveBeenCalledWith("/api/app/masuda_run/rankings.json", expect.any(Function))
    expect(result.current.rankings).toEqual([{ rank: 1, userId: "u1" }])
    expect(result.current.rankingsLoading).toBe(true)
    expect(result.current.rankingsError).toBe(false)
    expect(result.current.refreshRankings).toBe(mutate)
  })

  it("ランキング送信後に再取得する", async () => {
    const mutate = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useSWR).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate,
    })
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    })
    vi.stubGlobal("fetch", fetch)

    const { result } = renderHook(() => useRankings(true))

    await act(async () => {
      await result.current.submitRanking("1234", "cookie-user")
    })

    expect(fetch).toHaveBeenCalledWith("/api/app/masuda_run/rankings.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ score: "1234", userId: "cookie-user" }),
    })
    expect(mutate).toHaveBeenCalledTimes(1)
  })
})
