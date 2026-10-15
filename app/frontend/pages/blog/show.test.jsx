import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import BlogDetail from "./show"

vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLinkWithoutPrefetch } = await import("@/test/inertiaLinkMocks")
  return {
    Link: MockInertiaLinkWithoutPrefetch,
  }
})

const { seoMock } = vi.hoisted(() => ({
  seoMock: vi.fn(() => null),
}))

vi.mock("../../shared/components/SeoHead", () => ({
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

it("SEO本文で文字参照と属性内の記号・段落境界を正しく扱う", () => {
  render(<BlogDetail article={{ id: "html", title: "HTML", content: '<p title="a > b">A &amp; B</p><p>続き</p>' }} />)
  expect(seoMock.mock.calls.at(-1)[0].description).toBe("A & B 続き")
})

it("SEOの文字数境界で結合絵文字を切らない", () => {
  render(<BlogDetail article={{ id: "joined", content: "あ".repeat(119) + "👨‍👩‍👧‍👦後" }} />)
  expect(seoMock.mock.calls.at(-1)[0].description).toBe("あ".repeat(119) + "…")
})
