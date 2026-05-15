import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Home from "./home"

vi.mock("../shared/SeoHead", () => ({
  default: () => <div>seo</div>,
}))

vi.mock("../features/blog/ArticlesList", () => ({
  default: ({ articles, variant }) => (
    <div>
      articles:{articles.length} variant:{variant}
    </div>
  ),
}))

vi.mock("@/shared/lib/userId", () => ({
  ensureUserIdCookie: vi.fn(),
}))

describe("Home page", () => {
  it("ブログ記事一覧を表示し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText("seo")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "ブログ" })).not.toBeInTheDocument()
    expect(screen.getByText("articles:1 variant:divided")).toBeInTheDocument()
  })
})
