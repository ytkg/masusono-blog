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
      tags: "本,暮らし",
      content: "<p>本と生活の話です</p>",
    },
  ]

  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState(null, "", "/")
  })

  it("検索語が空なら記事一覧を表示しない", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toBeInTheDocument()
    expect(screen.getByText("著者から探す")).toBeInTheDocument()
    expect(screen.getByText("タグから探す")).toBeInTheDocument()
    expect(screen.queryByTestId("articles-list")).not.toBeInTheDocument()
  })

  it("検索語が空なら著者候補をタグ候補より上に表示し、クリックで著者検索する", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    expect(screen.getByText("著者から探す").compareDocumentPosition(screen.getByText("タグから探す"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(screen.getByText("@増田")).toBeInTheDocument()
    expect(screen.getByText("@その他1")).toBeInTheDocument()

    fireEvent.click(screen.getByText("@その他1"))

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("@その他1")
    expect(window.location.search).toBe("?q=%40%E3%81%9D%E3%81%AE%E4%BB%961")
  })

  it("検索語が空ならタグ候補を初出順ですべて表示し、クリックでタグ検索する", () => {
    const manyTaggedArticles = Array.from({ length: 13 }, (_, index) => ({
      id: `article-${index}`,
      title: `記事${index}`,
      author: "その他1",
      tags: `タグ${index}`,
      content: "<p>本文</p>",
    }))
    window.history.replaceState(null, "", "/search")

    render(<Search articles={manyTaggedArticles} />)

    expect(screen.getByText("タグから探す")).toBeInTheDocument()
    expect(screen.getAllByText(/^#タグ/)).toHaveLength(13)
    expect(screen.getByText("#タグ0").compareDocumentPosition(screen.getByText("#タグ12"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    fireEvent.click(screen.getByText("#タグ0"))

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("#タグ0")
    expect(window.location.search).toBe("?q=%23%E3%82%BF%E3%82%B00")
  })

  it("URLの q を初期検索語に使って記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E7%94%9F%E6%B4%BB")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("生活")
    expect(screen.queryByText("著者から探す")).not.toBeInTheDocument()
    expect(screen.queryByText("タグから探す")).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
  })

  it("@付きの検索語は著者だけを検索対象にする", () => {
    window.history.replaceState(null, "", "/search?q=%40%E3%81%9D%E3%81%AE%E4%BB%961")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("@その他1")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
  })

  it("空白区切りの AND 検索で記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E6%9C%AC%20%E6%9A%AE%E3%82%89%E3%81%97")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("本 暮らし")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
  })

  it("OR 検索で記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E9%81%A0%E8%B6%B3%20OR%20%E6%9A%AE%E3%82%89%E3%81%97")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("遠足 OR 暮らし")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2 variant:divided")
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
    expect(screen.getByText("タグから探す")).toBeInTheDocument()
    expect(screen.queryByTestId("articles-list")).not.toBeInTheDocument()
  })

  it("検索結果が0件なら空表示を出す", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "見つからない" } })

    expect(screen.queryByText("0件")).not.toBeInTheDocument()
    expect(screen.getByText("articles:0 variant:divided empty:該当する記事はありません。")).toBeInTheDocument()
  })

  it("タグで記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%23%E6%9A%AE%E3%82%89%E3%81%97")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("#暮らし")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
  })

  it("#付きの検索語はタグだけを検索対象にする", () => {
    window.history.replaceState(null, "", "/search?q=%23%E7%94%9F%E6%B4%BB")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("#生活")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:0 variant:divided")
  })
})
