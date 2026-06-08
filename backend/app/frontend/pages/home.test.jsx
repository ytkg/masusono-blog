import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import Home from "./home"

vi.mock("../shared/SeoHead", () => ({
  default: () => <div>seo</div>,
}))

vi.mock("../features/blog/ArticlesList", () => ({
  default: ({ articles, emptyMessage, variant }) => (
    <div data-testid="articles-list">
      articles:{articles.length} variant:{variant}
      {emptyMessage ? ` empty:${emptyMessage}` : null}
    </div>
  ),
}))

vi.mock("@/shared/lib/userId", () => ({
  ensureUserIdCookie: vi.fn(),
}))

describe("Home page", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("ブログ記事一覧を表示し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText("seo")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "ブログ" })).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "おすすめ" })).toHaveAttribute("aria-selected", "false")
    expect(screen.queryByRole("textbox", { name: "記事を検索" })).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
  })

  it("おすすめタブでは初回表示時に選んだランダム5件を表示し続ける", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5)
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    const articles = Array.from({ length: 8 }, (_, index) => ({
      id: `article-${index}`,
      title: `記事${index}`,
    }))

    render(<Home articles={articles} />)

    fireEvent.click(screen.getByRole("tab", { name: "おすすめ" }))

    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:5 variant:divided")
    expect(Math.random).toHaveBeenCalledTimes(7)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })

    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    fireEvent.click(screen.getByRole("tab", { name: "おすすめ" }))

    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:5 variant:divided")
    expect(Math.random).toHaveBeenCalledTimes(7)
    expect(scrollTo).toHaveBeenCalledTimes(3)
  })
})
