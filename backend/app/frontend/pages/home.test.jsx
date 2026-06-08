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

  it("記事リストの横スワイプで表示モードを切り替える", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5)
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    const articles = Array.from({ length: 8 }, (_, index) => ({
      id: `article-${index}`,
      title: `記事${index}`,
    }))

    render(<Home articles={articles} />)

    const swipeArea = screen.getByTestId("home-articles-swipe-area")

    fireEvent.pointerDown(swipeArea, { clientX: 180, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 100, clientY: 55 })

    expect(screen.getByRole("tab", { name: "おすすめ" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:5 variant:divided")
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })

    fireEvent.pointerDown(swipeArea, { clientX: 100, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 170, clientY: 50 })

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:8 variant:divided")
    expect(scrollTo).toHaveBeenCalledTimes(2)
  })

  it("縦移動が大きいスワイプでは表示モードを切り替えない", () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    const swipeArea = screen.getByTestId("home-articles-swipe-area")

    fireEvent.pointerDown(swipeArea, { clientX: 180, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 120, clientY: 100 })

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
