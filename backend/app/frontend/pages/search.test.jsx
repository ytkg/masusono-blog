import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import Search from "./search"

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

describe("Search page", () => {
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

  afterEach(() => {
    window.history.replaceState(null, "", "/")
  })

  it("検索語が空なら記事一覧を表示しない", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveFocus()
    expect(screen.getByText("記事を検索")).toBeInTheDocument()
    expect(screen.queryByTestId("articles-list")).not.toBeInTheDocument()
  })

  it("URLの q を初期検索語に使って記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E7%94%9F%E6%B4%BB")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("生活")
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
  })

  it("検索語の変更を URL に反映し、クリアで空状態に戻る", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "増田" } })

    expect(window.location.pathname).toBe("/search")
    expect(window.location.search).toBe("?q=%E5%A2%97%E7%94%B0")
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")

    fireEvent.click(screen.getByRole("button", { name: "検索語をクリア" }))

    expect(window.location.search).toBe("")
    expect(screen.getByText("記事を検索")).toBeInTheDocument()
    expect(screen.queryByTestId("articles-list")).not.toBeInTheDocument()
  })

  it("検索結果が0件なら空表示を出す", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "見つからない" } })

    expect(screen.queryByText("0件")).not.toBeInTheDocument()
    expect(screen.getByText("articles:0 variant:divided empty:該当する記事はありません。")).toBeInTheDocument()
  })
})
