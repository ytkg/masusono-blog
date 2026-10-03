import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleSearchSuggestions from "./ArticleSearchSuggestions"
import ArticleTags from "./ArticleTags"

vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLink } = await import("@/test/inertiaLinkMocks")
  return {
    Link: MockInertiaLink,
  }
})

describe("ArticleTags", () => {
  it("空白を除いたタグを検索リンクとして、検索ページと同じ色で表示する", () => {
    render(
      <>
        <ArticleTags tags=" Ruby, , Rails " />
        <ArticleSearchSuggestions articles={[{ tags: "Ruby" }]} onSelect={() => {}} />
      </>,
    )

    const rubyTag = screen.getByRole("link", { name: "#Ruby" })
    const searchRubyTag = screen.getByRole("button", { name: "#Ruby" })

    expect(rubyTag).toHaveAttribute("href", "/search?q=%23Ruby")
    expect(screen.getByRole("link", { name: "#Rails" })).toHaveAttribute("href", "/search?q=%23Rails")
    expect(getComputedStyle(rubyTag).color).toBe(getComputedStyle(searchRubyTag).color)
    expect(getComputedStyle(rubyTag).borderTopColor).toBe(getComputedStyle(searchRubyTag).borderTopColor)
  })

  it.each([null, undefined, "", " , "])("タグが %s の場合は何も表示しない", (tags) => {
    render(<ArticleTags tags={tags} />)

    expect(screen.queryByTestId("article-tags")).not.toBeInTheDocument()
  })
})
