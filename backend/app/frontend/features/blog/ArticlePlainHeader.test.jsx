import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticlePlainHeader from "./ArticlePlainHeader"

vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLink } = await import("@/test/inertiaLinkMocks")
  return {
    Link: MockInertiaLink,
  }
})

const defaultProps = {
  action: <button type="button">記事操作</button>,
  articleStats: "1,234字・約4分",
  author: "増田",
  authorHref: "/authors/masuda",
  date: "2026/07/31",
}

describe("ArticlePlainHeader", () => {
  it("一覧では著者メタと操作を表示する", () => {
    render(<ArticlePlainHeader {...defaultProps} mode="list" />)

    expect(screen.getByTestId("article-list-meta")).toHaveTextContent("増田2026/07/31 ・ 1,234字・約4分記事操作")
    expect(screen.getByTestId("article-meta-author")).toHaveAttribute("href", "/authors/masuda")
    expect(screen.getByRole("button", { name: "記事操作" })).toBeInTheDocument()
  })

  it("詳細では詳細用のヘッダー識別子を表示する", () => {
    render(<ArticlePlainHeader {...defaultProps} mode="detail" />)

    expect(screen.getByTestId("article-detail-header")).toHaveTextContent("増田2026/07/31 ・ 1,234字・約4分記事操作")
    expect(screen.getByTestId("article-detail-author")).toHaveAttribute("href", "/authors/masuda")
  })
})
