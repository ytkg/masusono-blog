import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Home from "./home"
import { TOGGLE_HOME_SEARCH_EVENT } from "../shared/homeSearchEvents"

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
  const articles = [
    {
      id: "article-1",
      title: "増田の遠足",
      author: "増田",
      content: "<p>朝から歩いた記事です</p>",
    },
    {
      id: "article-2",
      title: "読書メモ",
      author: "その他1",
      content: "<p>本と生活の話です</p>",
    },
  ]

  function openSearch() {
    act(() => {
      window.dispatchEvent(new Event(TOGGLE_HOME_SEARCH_EVENT))
    })
  }

  it("ブログ記事一覧を表示し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText("seo")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "ブログ" })).not.toBeInTheDocument()
    expect(screen.getByText("articles:1 variant:divided")).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: "記事を検索" })).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
  })

  it("検索表示イベントで検索欄を表示する", () => {
    render(<Home articles={articles} />)

    openSearch()

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveAttribute("placeholder", "記事を検索")
    expect(screen.getByRole("textbox", { name: "記事を検索" })).not.toHaveFocus()
  })

  it("検索欄を閉じると操作対象から外れる", () => {
    render(<Home articles={articles} />)

    openSearch()
    openSearch()

    expect(screen.queryByRole("textbox", { name: "記事を検索" })).not.toBeInTheDocument()
  })

  it("検索語でタイトル・本文・著者名を即時に絞り込む", () => {
    render(<Home articles={articles} />)
    openSearch()

    const input = screen.getByRole("textbox", { name: "記事を検索" })

    fireEvent.change(input, { target: { value: "増田" } })
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
    expect(screen.getByText("1件")).toBeInTheDocument()

    fireEvent.change(input, { target: { value: "生活" } })
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")

    fireEvent.change(input, { target: { value: "その他1" } })
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
  })

  it("検索結果が0件なら空表示を出し、クリアで一覧に戻す", () => {
    render(<Home articles={articles} />)
    openSearch()

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "見つからない" } })

    expect(screen.getByText("0件")).toBeInTheDocument()
    expect(screen.getByText("articles:0 variant:divided empty:該当する記事はありません。")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "検索語をクリア" }))

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("")
    expect(screen.queryByText("0件")).not.toBeInTheDocument()
    expect(screen.getByText("articles:2 variant:divided")).toBeInTheDocument()
  })

  it("検索中は検索表示イベントでも閉じない", () => {
    render(<Home articles={articles} />)
    openSearch()

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "増田" } })
    openSearch()

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toBeInTheDocument()
    expect(screen.getByText("1件")).toBeInTheDocument()
  })
})
