import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Blog from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title }) => <div>seo:{title}</div>,
}))

vi.mock("../../features/blog/ArticleFilters", () => ({
  default: ({ totalCount }) => <div>filters:{totalCount}</div>,
}))

vi.mock("../../features/blog/ArticlesList", () => ({
  default: ({ articles, emptyMessage }) => (
    <div>
      articles:{articles.length}:{emptyMessage}
    </div>
  ),
}))

describe("Blog page", () => {
  it("一覧ヘッダと記事一覧を描画する", () => {
    render(
      <Blog
        articles={[
          { id: "a1", title: "記事1", author: "増田", content: "<p>本文1</p>" },
          { id: "a2", title: "記事2", author: "その他1", content: "<p>本文2</p>" },
        ]}
      />,
    )

    expect(screen.getByText("seo:ブログ")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByText("filters:2")).toBeInTheDocument()
    expect(screen.getByText("articles:2:記事がありません。")).toBeInTheDocument()
  })

  it("記事がなければフィルタを出さず空状態を渡す", () => {
    render(<Blog articles={[]} />)

    expect(screen.queryByText(/filters:/)).not.toBeInTheDocument()
    expect(screen.getByText("articles:0:記事がありません。")).toBeInTheDocument()
  })
})
