import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { usePage } from "@inertiajs/react"
import useCurrentPathSegmentId from "./useCurrentPathSegmentId"

vi.mock("@inertiajs/react", () => ({
  usePage: vi.fn(),
}))

describe("useCurrentPathSegmentId", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("末尾セグメントをクエリ除去とデコード後に返す", () => {
    usePage.mockReturnValue({ url: "/blog/%E5%A2%97%E7%94%B0%20%E3%83%86%E3%82%B9%E3%83%88/?page=2" })

    const { result } = renderHook(() => useCurrentPathSegmentId())

    expect(result.current).toBe("増田 テスト")
  })

  it("不正なエンコードはそのまま返す", () => {
    usePage.mockReturnValue({ url: "/blog/%E0%A4%A" })

    const { result } = renderHook(() => useCurrentPathSegmentId())

    expect(result.current).toBe("%E0%A4%A")
  })
})
