import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import useArticleSearchQuery from "./useArticleSearchQuery"

describe("useArticleSearchQuery", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/")
  })

  it("URLのqパラメータを初期値にする", () => {
    window.history.replaceState({}, "", "/search?q=Ruby%20on%20Rails")

    const { result } = renderHook(() => useArticleSearchQuery())

    expect(result.current[0]).toBe("Ruby on Rails")
  })

  it("置換・追加の両方でクエリとURLを同期する", () => {
    window.history.replaceState({}, "", "/search?page=2#results")
    const { result } = renderHook(() => useArticleSearchQuery())

    act(() => {
      result.current[1]("Ruby")
    })

    expect(result.current[0]).toBe("Ruby")
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      "/search?page=2&q=Ruby#results",
    )

    act(() => {
      result.current[2]("")
    })

    expect(result.current[0]).toBe("")
    expect(window.location.pathname + window.location.search + window.location.hash).toBe("/search?page=2#results")
  })

  it("ブラウザの戻る・進む操作でクエリを読み直す", () => {
    window.history.replaceState({}, "", "/search?q=before")
    const { result } = renderHook(() => useArticleSearchQuery())

    act(() => {
      window.history.replaceState({}, "", "/search?q=after")
      window.dispatchEvent(new PopStateEvent("popstate"))
    })

    expect(result.current[0]).toBe("after")
  })
})
