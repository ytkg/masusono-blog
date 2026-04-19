import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useApiSWR from "@/shared/hooks/useApiSWR"
import useMetrics from "./useMetrics"

vi.mock("@/shared/hooks/useApiSWR", () => ({
  default: vi.fn(),
}))

describe("useMetrics", () => {
  it("enabled=false の間は取得を無効化する", () => {
    vi.mocked(useApiSWR).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useMetrics(false))

    expect(useApiSWR).toHaveBeenCalledWith("/api/app/numbers/metrics.json", false)
    expect(result.current).toEqual({
      metrics: null,
      isLoading: false,
      error: null,
      hasError: false,
      refresh: expect.any(Function),
    })
  })

  it("SWR の状態を公開する", () => {
    const mutate = vi.fn()
    const error = new Error("boom")
    vi.mocked(useApiSWR).mockReturnValue({
      data: { blocks: [{ label: "記事数", value: "10 本" }] },
      error,
      isLoading: true,
      mutate,
    })

    const { result } = renderHook(() => useMetrics(true))

    expect(useApiSWR).toHaveBeenCalledWith("/api/app/numbers/metrics.json", true)
    expect(result.current.metrics).toEqual({ blocks: [{ label: "記事数", value: "10 本" }] })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(error)
    expect(result.current.hasError).toBe(true)
    expect(result.current.refresh).toBe(mutate)
  })
})
