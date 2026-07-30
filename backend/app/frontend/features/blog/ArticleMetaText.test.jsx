import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleMetaText from "./ArticleMetaText"

vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    Link: React.forwardRef(function MockLink({ href, children, ...props }, ref) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      )
    }),
  }
})

describe("ArticleMetaText", () => {
  it("著者ページ、日付、記事統計を表示する", () => {
    render(
      <ArticleMetaText author="増田" authorHref="/authors/masuda" date="2026/07/31" articleStats="1,234字・約4分" />,
    )

    expect(screen.getByTestId("article-meta-author")).toHaveAttribute("href", "/authors/masuda")
    expect(screen.getByTestId("article-list-meta-text")).toHaveTextContent("増田2026/07/31 ・ 1,234字・約4分")
  })

  it("詳細モードでは詳細用の識別子を使う", () => {
    render(<ArticleMetaText author="増田" date="2026/07/31" mode="detail" />)

    expect(screen.getByTestId("article-detail-author")).toHaveTextContent("増田")
    expect(screen.getByTestId("article-detail-meta")).toHaveTextContent("2026/07/31")
  })
})
