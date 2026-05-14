import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleCard from "./ArticleCard"

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

    expect(screen.getByRole("link", { name: "Hello" })).toHaveAttribute("href", "/blog/hello-world")
    expect(screen.getByText("本文です")).toBeInTheDocument()
    expect(screen.getByText("2026/03/09 増田")).toBeInTheDocument()
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
