import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, type MockedFunction, vi } from "vitest"
import type { Article } from "@/types/article"
import { useArticle } from "./useArticle"
import { useArticles } from "./useArticles"

vi.mock("./useArticles", () => ({
  useArticles: vi.fn(),
}))

const useArticlesMock = useArticles as unknown as MockedFunction<typeof useArticles>

const createUseArticlesResult = (overrides: Partial<ReturnType<typeof useArticles>> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  }) as ReturnType<typeof useArticles>

const fallbackArticle: Article = {
  id: "fallback",
  title: "fallback title",
  publishedDate: "2026/02/08",
  content: "fallback content",
  author: "masuda",
}

describe("useArticle", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("idがない場合はfallbackを返し、loadingをfalseにする", () => {
    useArticlesMock.mockReturnValue(createUseArticlesResult({ isLoading: true }))

    const { result } = renderHook(() => useArticle(undefined, fallbackArticle))

    expect(result.current.data).toEqual(fallbackArticle)
    expect(result.current.isLoading).toBe(false)
  })

  it("idに一致する記事がある場合は該当記事を返す", () => {
    const article: Article = {
      id: "article-1",
      title: "title",
      publishedDate: "2026/02/08",
      content: "content",
      author: "masuda",
    }
    useArticlesMock.mockReturnValue(createUseArticlesResult({ data: [article] }))

    const { result } = renderHook(() => useArticle("article-1"))

    expect(result.current.data).toEqual(article)
    expect(result.current.error).toBeUndefined()
  })

  it("記事が見つからない場合でもfallbackがあればfallbackを返す", () => {
    const article: Article = {
      id: "article-1",
      title: "title",
      publishedDate: "2026/02/08",
      content: "content",
      author: "masuda",
    }
    useArticlesMock.mockReturnValue(createUseArticlesResult({ data: [article] }))

    const { result } = renderHook(() => useArticle("missing", fallbackArticle))

    expect(result.current.data).toEqual(fallbackArticle)
    expect(result.current.error).toBeUndefined()
  })

  it("id指定かつ記事が見つからない場合はnot foundエラーを返す", () => {
    useArticlesMock.mockReturnValue(createUseArticlesResult({ data: [] }))

    const { result } = renderHook(() => useArticle("missing"))

    expect(result.current.data).toBeUndefined()
    expect(result.current.error?.message).toBe("記事が見つかりません。")
  })

  it("SWRエラーがある場合はそちらを優先する", () => {
    const swrError = new Error("network error")
    useArticlesMock.mockReturnValue(createUseArticlesResult({ data: [], error: swrError }))

    const { result } = renderHook(() => useArticle("missing"))

    expect(result.current.error).toBe(swrError)
  })
})
