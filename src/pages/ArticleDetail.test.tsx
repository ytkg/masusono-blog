import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { vi } from "vitest"
import ArticleDetail from "./ArticleDetail"
import { useArticle } from "../hooks/useArticle"
import { usePageMeta } from "../hooks/usePageMeta"
import type { Article } from "../types/article"

vi.mock("../hooks/useArticle", () => ({
  useArticle: vi.fn(),
}))

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

const useArticleMock = useArticle as unknown as vi.MockedFunction<typeof useArticle>
const usePageMetaMock = usePageMeta as unknown as vi.MockedFunction<typeof usePageMeta>

const createUseArticleResult = (overrides: Partial<ReturnType<typeof useArticle>> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  }) as ReturnType<typeof useArticle>

describe("ArticleDetail", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("記事IDがない場合はブログ一覧にリダイレクトする", async () => {
    useArticleMock.mockReturnValue(createUseArticleResult())

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<ArticleDetail />} />
          <Route path="/blog" element={<div>ブログ一覧</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText("ブログ一覧")).toBeInTheDocument()
  })

  it("取得済みの記事を表示し、メタ情報を設定する", () => {
    const article: Article = {
      id: "abc",
      title: "テスト記事",
      content: "<p>本文テキスト</p>",
      publishedAt: "2024-01-02",
      author: { name: "Tester" },
    }
    useArticleMock.mockReturnValue(createUseArticleResult({ data: article }))

    render(
      <MemoryRouter initialEntries={[{ pathname: "/blog/abc", state: { article } }]}>
        <Routes>
          <Route path="/blog/:articleId" element={<ArticleDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 2, name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "テスト記事" })).toBeInTheDocument()
    expect(screen.getByText("本文テキスト")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "記事一覧に戻る" })).toHaveAttribute("href", "/blog")
    expect(usePageMetaMock).toHaveBeenCalled()
    const metaArgs = usePageMetaMock.mock.calls[0]?.[0]
    expect(metaArgs).toMatchObject({ title: "テスト記事", canonicalPath: "/blog/abc" })
    expect(metaArgs?.description).toContain("本文テキスト")
  })

  it("エラーがある場合はエラーメッセージを表示する", () => {
    useArticleMock.mockReturnValue(createUseArticleResult({ error: new Error("取得失敗") }))

    render(
      <MemoryRouter initialEntries={["/blog/xyz"]}>
        <Routes>
          <Route path="/blog/:articleId" element={<ArticleDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 2, name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByText("取得失敗")).toBeInTheDocument()
  })
})
