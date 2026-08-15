import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleSearchSuggestions from "./ArticleSearchSuggestions"
import ArticleTags from "./ArticleTags"

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

  it("タグがない場合は何も表示しない", () => {
    render(<ArticleTags tags=" , " />)

    expect(screen.queryByTestId("article-tags")).not.toBeInTheDocument()
  })
})
