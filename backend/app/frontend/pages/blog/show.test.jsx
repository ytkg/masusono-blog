import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import BlogDetail from "./show"

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

const { seoMock } = vi.hoisted(() => ({
  seoMock: vi.fn(() => null),
}))

vi.mock("../../shared/SeoHead", () => ({
  default: seoMock,
}))

vi.mock("../../features/blog/ArticleCard", () => ({
  default: ({ article, mode }) => <div>{`article:${mode}:${article?.title ?? "missing"}`}</div>,
}))

describe("BlogDetail page", () => {
  it("メタ description を本文 HTML から生成する", () => {
    render(
      <BlogDetail
        article={{
          id: "hello-world",
          title: "Hello",
          content: `<p>${"あ".repeat(130)}</p>`,
        }}
      />,
    )

    const [{ title, description, canonicalPath }] = seoMock.mock.calls[0]
    expect(title).toBe("Hello")
    expect(description).toBe(`${"あ".repeat(120)}…`)
    expect(canonicalPath).toBe("/articles/hello-world")
    expect(screen.queryByRole("heading", { name: "ブログ" })).not.toBeInTheDocument()
    expect(screen.getByText("article:detail:Hello")).toBeInTheDocument()
  })

  it("article がなければトップページ canonical に戻す", () => {
    render(<BlogDetail article={null} />)

    const [{ title, description, canonicalPath }] = seoMock.mock.calls.at(-1)
    expect(title).toBe("ブログ記事")
    expect(description).toBeUndefined()
    expect(canonicalPath).toBe("/")
  })
})
