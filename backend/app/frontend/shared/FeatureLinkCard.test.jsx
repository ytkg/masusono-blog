import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import FeatureLinkCard from "./FeatureLinkCard"

vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    Link: React.forwardRef(function MockLink({ href, prefetch: _prefetch, children, ...props }, ref) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      )
    }),
  }
})

describe("FeatureLinkCard", () => {
  it("タイトル、説明、リンクを描画する", () => {
    render(
      <FeatureLinkCard title="ブログ" description="最新の記事です" href="/blog">
        <span>子要素</span>
      </FeatureLinkCard>,
    )

    expect(screen.getByRole("link", { name: /ブログ/ })).toHaveAttribute("href", "/blog")
    expect(screen.getByText("最新の記事です")).toBeInTheDocument()
    expect(screen.getByText("子要素")).toBeInTheDocument()
  })
})
