import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Blog from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title }) => <div>seo:{title}</div>,
}))

vi.mock("../../features/blog/ArticlesList", () => ({
  default: ({ articles }) => <div>articles:{articles.length}</div>,
}))

describe("Blog page", () => {
  it("一覧ヘッダと記事一覧を描画する", () => {
    render(<Blog articles={[{ id: "a1" }, { id: "a2" }]} />)

    expect(screen.getByText("seo:ブログ")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByText("articles:2")).toBeInTheDocument()
  })
})
