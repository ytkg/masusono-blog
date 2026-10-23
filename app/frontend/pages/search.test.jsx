import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Search from "./search"

vi.mock("../shared/components/SeoHead", () => ({
  default: () => <div>seo</div>,
}))

vi.mock("../features/blog/ArticlesList", () => ({
  default: ({ articles, emptyMessage }) => (
    <div data-testid="articles-list">
      articles:{articles.length}
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
      readingTimeMinutes: 1,
      content: "<p>朝から歩いた記事です</p>",
    },
    {
      id: "article-2",
      title: "読書メモ",
      author: "その他1",
      tags: "本,暮らし",
      readingTimeMinutes: 5.5,
      content: "<p>本と生活の話です</p>",
    },
  ]

  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.history.replaceState(null, "", "/")
  })

  it("未検索時だけ広告枠を表示し、検索語の変更と履歴移動後に初期化する", () => {
    window.history.replaceState(null, "", "/search")
    const renderAd = vi.fn()
    window.MasusonoAds = { render: renderAd }
    const { container } = render(<Search articles={articles} />)

    expect(container.querySelectorAll('[data-masusono-ad="search-bottom"]')).toHaveLength(1)
    expect(renderAd).toHaveBeenCalledOnce()
    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "読書" } })
    expect(container.querySelector('[data-masusono-ad="search-bottom"]')).not.toBeInTheDocument()
    expect(renderAd).toHaveBeenCalledTimes(2)
    expect(window.location.search).toBe("?q=%E8%AA%AD%E6%9B%B8")
    window.history.replaceState(null, "", "/search")
    fireEvent.popState(window)
    expect(container.querySelectorAll('[data-masusono-ad="search-bottom"]')).toHaveLength(1)
    expect(renderAd).toHaveBeenCalledTimes(3)
    delete window.MasusonoAds
  })

  it("検索語が空なら記事一覧を表示しない", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toBeInTheDocument()
    expect(screen.getByText("著者から探す")).toBeInTheDocument()
    expect(screen.getByText("タグから探す")).toBeInTheDocument()
    expect(screen.getByText("読了目安から探す")).toBeInTheDocument()
    expect(screen.queryByTestId("articles-list")).not.toBeInTheDocument()
  })

  it("HTMLに見えるURL入力を空検索にせず、本文に表示される文字と照合する", () => {
    window.history.replaceState(null, "", "/search?q=%3CRuby%3E")
    render(
      <Search
        articles={[
          { id: "visible", title: "サンプル", content: "<p>&lt;Ruby&gt;</p>" },
          { id: "markup", title: "無関係", content: "<ruby>本文</ruby>" },
        ]}
      />,
    )

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("<Ruby>")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
    expect(screen.queryByText("タグから探す")).not.toBeInTheDocument()
  })

  it.each([
    ["#<Ruby>", "tags"],
    ["@A <B>", "author"],
  ])("HTMLに見える候補を選択しても対象を絞り込み、クリアで候補を復元する: %s", (label, field) => {
    window.history.replaceState(null, "", "/search")
    render(
      <Search
        articles={[
          { id: "literal", title: "対象", [field]: label.slice(1) },
          { id: "other", title: "無関係", [field]: "other" },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: label }))
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
    fireEvent.click(screen.getByRole("button", { name: "検索語をクリア" }))
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument()
    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "<missing>" } })
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:0")
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

  it("検索語が空なら読了目安候補を表示し、クリックで読了目安検索する", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    expect(screen.getByText("読了目安から探す")).toBeInTheDocument()
    expect(screen.getByText("~1分")).toBeInTheDocument()
    expect(screen.getByText("1~2分")).toBeInTheDocument()
    expect(screen.getByText("2~3分")).toBeInTheDocument()
    expect(screen.getByText("3~5分")).toBeInTheDocument()
    expect(screen.getByText("5分~")).toBeInTheDocument()

    fireEvent.click(screen.getByText("~1分"))

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("read:1")
    expect(window.location.search).toBe("?q=read%3A1")
  })

  it("候補クリックは履歴を積み、ブラウザバックで候補画面に戻る", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    fireEvent.click(screen.getByText("#本"))

    expect(window.location.search).toBe("?q=%23%E6%9C%AC")
    expect(screen.queryByText("タグから探す")).not.toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })

    window.history.replaceState(null, "", "/search")
    fireEvent.popState(window)

    expect(window.location.pathname).toBe("/search")
    expect(window.location.search).toBe("")
    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("")
    expect(screen.getByText("タグから探す")).toBeInTheDocument()
  })

  it("URLの q を初期検索語に使って記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E7%94%9F%E6%B4%BB")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("生活")
    expect(screen.queryByText("著者から探す")).not.toBeInTheDocument()
    expect(screen.queryByText("タグから探す")).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })

  it("@付きの検索語は著者だけを検索対象にする", () => {
    window.history.replaceState(null, "", "/search?q=%40%E3%81%9D%E3%81%AE%E4%BB%961")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("@その他1")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })

  it("空白区切りの AND 検索で記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E6%9C%AC%20%E6%9A%AE%E3%82%89%E3%81%97")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("本 暮らし")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })

  it("OR 検索で記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%E9%81%A0%E8%B6%B3%20OR%20%E6%9A%AE%E3%82%89%E3%81%97")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("遠足 OR 暮らし")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:2")
  })

  it("検索語の変更を URL に反映し、クリアで空状態に戻る", () => {
    window.history.replaceState(null, "", "/search")

    render(<Search articles={articles} />)

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "増田" } })

    expect(window.location.pathname).toBe("/search")
    expect(window.location.search).toBe("?q=%E5%A2%97%E7%94%B0")
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")

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
    expect(screen.getByText("articles:0 empty:該当する記事はありません。")).toBeInTheDocument()
  })

  it("タグで記事を絞り込む", () => {
    window.history.replaceState(null, "", "/search?q=%23%E6%9A%AE%E3%82%89%E3%81%97")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("#暮らし")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })

  it("#付きの検索語はタグだけを検索対象にする", () => {
    window.history.replaceState(null, "", "/search?q=%23%E7%94%9F%E6%B4%BB")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("#生活")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:0")
  })

  it("read:N は読了目安がN分以内の記事だけを検索対象にする", () => {
    window.history.replaceState(null, "", "/search?q=read%3A1")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("read:1")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })

  it("read:N+ は読了目安がN分以上の記事だけを検索対象にする", () => {
    window.history.replaceState(null, "", "/search?q=read%3A5%2B")

    render(<Search articles={articles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("read:5+")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })

  it("read:N-M は読了目安がN分より長くM分以内の記事だけを検索対象にする", () => {
    const rangedArticles = [
      { id: "short", title: "短い", author: "増田", readingTimeMinutes: 1, content: "<p>本文</p>" },
      { id: "middle", title: "中くらい", author: "増田", readingTimeMinutes: 1.5, content: "<p>本文</p>" },
      { id: "long", title: "長い", author: "増田", readingTimeMinutes: 2.5, content: "<p>本文</p>" },
    ]
    window.history.replaceState(null, "", "/search?q=read%3A1-2")

    render(<Search articles={rangedArticles} />)

    expect(screen.getByRole("textbox", { name: "記事を検索" })).toHaveValue("read:1-2")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1")
  })
})
