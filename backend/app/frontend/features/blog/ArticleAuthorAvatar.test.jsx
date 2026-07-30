import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleAuthorAvatar from "./ArticleAuthorAvatar"

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

describe("ArticleAuthorAvatar", () => {
  it("著者ページへのリンクと画像を表示する", () => {
    render(
      <ArticleAuthorAvatar author="増田" authorHref="/authors/masuda" avatarSrc="https://example.test/masuda.webp" />,
    )

    expect(screen.getByLabelText("増田の著者ページへ")).toHaveAttribute("href", "/authors/masuda")
    expect(screen.getByRole("img", { name: "増田" })).toHaveAttribute("src", "https://example.test/masuda.webp")
  })

  it("著者ページがない場合はリンクにしない", () => {
    render(<ArticleAuthorAvatar author="増田" />)

    expect(screen.queryByLabelText("増田の著者ページへ")).not.toBeInTheDocument()
    expect(screen.getByText("増")).toBeInTheDocument()
  })
})
