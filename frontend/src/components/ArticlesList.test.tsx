import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { type MockedFunction, vi } from "vitest"
import ArticlesList from "./ArticlesList"
import { useArticles } from "../hooks/useArticles"
import type { Article } from "../types/article"

vi.mock("../hooks/useArticles", () => ({
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

describe("ArticlesList", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("ロード中はスケルトンを表示する", () => {
    useArticlesMock.mockReturnValue(createUseArticlesResult({ isLoading: true }))

    const { container } = render(
      <MemoryRouter>
        <ArticlesList />
      </MemoryRouter>,
    )

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0)
  })

  it("エラー時はメッセージを表示する", () => {
    useArticlesMock.mockReturnValue(createUseArticlesResult({ error: new Error("API error") }))

    render(
      <MemoryRouter>
        <ArticlesList />
      </MemoryRouter>,
    )

    expect(screen.getByText("記事の取得に失敗しました: API error")).toBeInTheDocument()
  })

  it("記事がある場合はリストを表示する", () => {
    const articles: Article[] = [
      { id: "1", title: "初めての投稿", content: "本文", author: { name: "Masuda" }, publishedDate: "2024-01-01" },
    ]
    useArticlesMock.mockReturnValue(createUseArticlesResult({ data: articles }))

    render(
      <MemoryRouter>
        <ArticlesList />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 3, name: "初めての投稿" })).toBeInTheDocument()
  })
})
