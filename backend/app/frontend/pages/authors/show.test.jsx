import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AuthorShow from "./show"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title, canonicalPath }) => (
    <div>
      seo:{title}:{canonicalPath}
    </div>
  ),
}))

vi.mock("../../features/blog/ArticlesList", () => ({
  default: ({ articles }) => (
    <div>
      articles:{articles.length}
    </div>
  ),
}))

describe("AuthorShow page", () => {
  it("著者プロフィールと著者の記事一覧を表示する", () => {
    render(
      <AuthorShow
        author={{
          id: "9wgrey2lh3",
          name: "増田",
          title: "友達と行事に全力で参加する人",
          bio: "プロフィール本文",
          imageUrl: "/masuda.webp",
        }}
        articles={[{ id: "article-1", title: "記事1" }]}
      />,
    )

    expect(screen.getByText("seo:増田:/authors/9wgrey2lh3")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "増田" })).toBeInTheDocument()
    expect(screen.getByText("友達と行事に全力で参加する人")).toBeInTheDocument()
    expect(screen.getByText("プロフィール本文")).toHaveStyle({ textAlign: "left" })
    expect(screen.queryByText("AIが考えたプロフィール文")).not.toBeInTheDocument()
    expect(screen.getByRole("img", { name: "増田のアイコン" })).toHaveAttribute("src", "/masuda.webp")
    expect(screen.getByRole("heading", { name: "投稿" })).toBeInTheDocument()
    expect(screen.getByText("1件")).toBeInTheDocument()
    expect(screen.getByText("articles:1")).toBeInTheDocument()
  })
})
