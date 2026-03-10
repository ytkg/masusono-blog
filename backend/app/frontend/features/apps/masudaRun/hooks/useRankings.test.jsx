import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useApiSWR from "../../../../shared/hooks/useApiSWR"
import useRankings from "./useRankings"

vi.mock("../../../../shared/hooks/useApiSWR", () => ({
  default: vi.fn(),
}))

describe("useRankings", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("SWR の読み込み状態を整形する", () => {
    const mutate = vi.fn()
    vi.mocked(useApiSWR).mockReturnValue({
      data: [{ rank: 1, userId: "u1" }],
      error: null,
      isLoading: true,
      mutate,
    })

    const { result } = renderHook(() => useRankings(true))

    expect(useApiSWR).toHaveBeenCalledWith("/api/app/masuda_run/rankings.json", true)
    expect(result.current.rankings).toEqual([{ rank: 1, userId: "u1" }])
    expect(result.current.rankingsLoading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.rankingsError).toBe(false)
    expect(result.current.refreshRankings).toBe(mutate)
  })

  it("ランキング送信後に再取得する", async () => {
    const mutate = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useApiSWR).mockReturnValue({
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
      cache: "no-store",
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
