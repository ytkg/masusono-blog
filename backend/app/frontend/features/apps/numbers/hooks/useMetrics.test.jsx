import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import useMetrics from "./useMetrics"

vi.mock("swr", () => ({
  default: vi.fn(),
}))

describe("useMetrics", () => {
  it("enabled=false の間は取得を無効化する", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useMetrics(false))

    expect(useSWR).toHaveBeenCalledWith(null, expect.any(Function))
    expect(result.current).toEqual({
      metrics: null,
      isLoading: false,
      hasError: false,
      refresh: expect.any(Function),
    })
  })

  it("SWR の状態を公開する", () => {
    const mutate = vi.fn()
    vi.mocked(useSWR).mockReturnValue({
      data: { blocks: [{ label: "記事数", value: "10 本" }] },
      error: new Error("boom"),
      isLoading: true,
      mutate,
    })

    const { result } = renderHook(() => useMetrics(true))

    expect(useSWR).toHaveBeenCalledWith("/api/app/numbers/metrics.json", expect.any(Function))
    expect(result.current.metrics).toEqual({ blocks: [{ label: "記事数", value: "10 本" }] })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.hasError).toBe(true)
    expect(result.current.refresh).toBe(mutate)
  })
})
