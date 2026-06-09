import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleCard from "./ArticleCard"
import { extractTextFromHtml } from "./articleHtmlText"

vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    Link: React.forwardRef(function MockLink({ href, prefetch: _prefetch, children, ...props }, ref) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      )
    }),
  }
})

describe("ArticleCard", () => {
  function mockClipboard() {
    const writeText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })

    return writeText
  }

  it("article がない場合は案内を表示する", () => {
    render(<ArticleCard article={null} />)

    expect(screen.getByText("記事が見つかりません。")).toBeInTheDocument()
  })

  it("一覧モードでは記事リンクと本文 HTML を表示する", () => {
    render(
      <ArticleCard
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByRole("link", { name: "Hello" })).toHaveAttribute("href", "/articles/hello-world")
    expect(screen.getByText("本文です")).toBeInTheDocument()
    expect(screen.getByText("増田 2026/03/09")).toBeInTheDocument()
  })

  it("記事メニューから記事URLをコピーできる", async () => {
    const writeText = mockClipboard()

    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "記事メニューを開く" }))
    fireEvent.click(screen.getByRole("menuitem", { name: "記事URLをコピー" }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("http://localhost:3000/articles/hello-world")
    })
    expect(await screen.findByText("記事URLをコピーしました")).toBeInTheDocument()
  })

  it("本文内リンクには下線スタイルを付ける", () => {
    render(
      <ArticleCard
        mode="detail"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: '<p><a href="https://example.com">本文リンク</a></p>',
        }}
      />,
    )

    expect(screen.getByRole("link", { name: "本文リンク" })).toHaveStyle({ textDecoration: "underline" })
  })

  it("ブログ本文は薄めの色で表示する", () => {
    render(
      <ArticleCard
        mode="detail"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByTestId("article-body-html")).toHaveStyle({ color: "rgba(0, 0, 0, 0.6)" })
  })

  it("本文内画像には角丸スタイルを付ける", () => {
    render(
      <ArticleCard
        mode="detail"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: '<figure><img src="/photo.jpg" alt="本文画像"></figure>',
        }}
      />,
    )

    expect(screen.getByRole("img", { name: "本文画像" })).toHaveStyle({ borderRadius: "12px" })
  })

  it("plain presentation ではカード枠を消す", () => {
    const { container } = render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(container.querySelector(".MuiBox-root")).toContainElement(screen.getByRole("link", { name: "Hello" }))
  })

  it("plain presentation では著者と日付をタイトルより上に表示する", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    const meta = screen.getByTestId("article-list-meta")
    const title = screen.getByRole("link", { name: "Hello" })

    expect(meta).toHaveTextContent("増田2026/03/09")
    expect(meta.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("plain presentation では著者名を日付より目立たせる", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByTestId("article-meta-author")).toHaveStyle({ fontWeight: "700" })
  })

  it("plain presentation では著者名から著者ページへ遷移できる", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          authorId: "9wgrey2lh3",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByTestId("article-meta-author")).toHaveAttribute("href", "/authors/9wgrey2lh3")
  })

  it("plain presentation では日付付近に文字数と読了目安を表示する", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          characterCount: 1234,
          readingTimeMinutes: 4,
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByTestId("article-list-meta")).toHaveTextContent("増田2026/03/09 ・ 1,234字・約4分")
  })

  it("読了目安は0.5分刻みで表示する", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          characterCount: 120,
          readingTimeMinutes: 0.5,
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByTestId("article-list-meta")).toHaveTextContent("120字・約0.5分")
  })

  it("カード表示では文字数と読了目安をメタ情報として表示する", () => {
    render(
      <ArticleCard
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          characterCount: 1234,
          readingTimeMinutes: 4,
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByText("増田 2026/03/09 ・ 1,234字・約4分")).toBeInTheDocument()
  })

  it("plain presentation では著者アイコンから著者ページへ遷移できる", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          authorId: "9wgrey2lh3",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByRole("link", { name: "増田の著者ページへ" })).toHaveAttribute("href", "/authors/9wgrey2lh3")
  })

  it("plain presentation ではAPI由来の著者画像URLをアイコンに使う", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          authorId: "9wgrey2lh3",
          authorImageUrl: "/author.webp",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByRole("img", { name: "増田" })).toHaveAttribute("src", "/author.webp")
    expect(screen.getByRole("link", { name: "増田の著者ページへ" })).toHaveStyle({ width: "48px", height: "48px" })
  })

  it("plain presentation の一覧では抜粋を表示し、その場で全文を展開できる", () => {
    const longText = "あ".repeat(100)

    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: `<p>${longText}</p><p>追加本文</p>`,
        }}
      />,
    )

    expect(screen.getByText(`${"あ".repeat(80)}…`)).toBeInTheDocument()
    expect(screen.queryByText("追加本文")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "続きを読む" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "続きを読む" }))

    expect(screen.getByText(longText)).toBeInTheDocument()
    expect(screen.getByText("追加本文")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument()
  })

  it("plain presentation の一覧では展開前に本文画像を描画しない", () => {
    render(
      <ArticleCard
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: '<p>本文です</p><figure><img src="/photo.jpg" alt="本文画像"></figure>',
        }}
      />,
    )

    expect(screen.queryByRole("img", { name: "本文画像" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "続きを読む" }))

    expect(screen.getByRole("img", { name: "本文画像" })).toHaveAttribute("src", "/photo.jpg")
  })

  it("抜粋生成では本文 HTML を DOM 化しない", () => {
    const createElement = vi.spyOn(document, "createElement")

    expect(extractTextFromHtml('<p>本文 &amp; 続き</p><img src="/photo.jpg" alt="本文画像">')).toBe("本文 & 続き")
    expect(createElement).not.toHaveBeenCalled()

    createElement.mockRestore()
  })

  it("詳細の plain presentation では著者情報を記事部分の上に表示する", () => {
    render(
      <ArticleCard
        mode="detail"
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          authorId: "9wgrey2lh3",
          content: "<p>本文です</p>",
        }}
      />,
    )

    const author = screen.getByTestId("article-detail-author")
    const meta = screen.getByTestId("article-detail-meta")
    const title = screen.getByRole("heading", { name: "Hello" })

    expect(author).toHaveAttribute("href", "/authors/9wgrey2lh3")
    expect(screen.getByText("2026/03/09")).toBeInTheDocument()
    expect(meta).toHaveStyle({ display: "grid" })
    expect(author.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("詳細の plain presentation では著者情報付近に文字数と読了目安を表示する", () => {
    render(
      <ArticleCard
        mode="detail"
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          characterCount: 1234,
          readingTimeMinutes: 4,
          author: "増田",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.getByTestId("article-detail-meta")).toHaveTextContent("増田2026/03/09 ・ 1,234字・約4分")
  })

  it("タイトルと本文の間にタグを表示する", () => {
    render(
      <ArticleCard
        mode="detail"
        presentation="plain"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          tags: "旅行, 日記,,Ruby ",
          content: "<p>本文です</p>",
        }}
      />,
    )

    const title = screen.getByRole("heading", { name: "Hello" })
    const tags = screen.getByTestId("article-tags")
    const body = screen.getByTestId("article-body-html")

    expect(screen.getByText("#旅行")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "#日記" })).toHaveAttribute("href", "/search?q=%23%E6%97%A5%E8%A8%98")
    expect(screen.getByText("#Ruby")).toBeInTheDocument()
    expect(tags.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(tags.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("タグが空なら表示しない", () => {
    render(
      <ArticleCard
        mode="detail"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          tags: " , ,, ",
          content: "<p>本文です</p>",
        }}
      />,
    )

    expect(screen.queryByTestId("article-tags")).not.toBeInTheDocument()
  })

  it("本文が空ならフォールバックを表示する", () => {
    render(
      <ArticleCard
        mode="detail"
        article={{
          id: "hello-world",
          title: "Hello",
          publishedDate: "2026/03/09",
          author: "増田",
          content: "   ",
        }}
      />,
    )

    expect(screen.queryByRole("link", { name: "Hello" })).not.toBeInTheDocument()
    expect(screen.getByText("本文がありません。")).toBeInTheDocument()
  })
})
