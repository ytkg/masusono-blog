import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
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
  it("空白を除いたタグを検索リンクとして表示する", () => {
    render(<ArticleTags tags=" Ruby, , Rails " />)

    expect(screen.getByRole("link", { name: "#Ruby" })).toHaveAttribute("href", "/search?q=%23Ruby")
    expect(screen.getByRole("link", { name: "#Rails" })).toHaveAttribute("href", "/search?q=%23Rails")
  })

  it("タグがない場合は何も表示しない", () => {
    render(<ArticleTags tags=" , " />)

    expect(screen.queryByTestId("article-tags")).not.toBeInTheDocument()
  })
})
