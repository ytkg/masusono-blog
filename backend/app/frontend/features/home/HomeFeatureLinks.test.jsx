import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomeFeatureLinks from "./HomeFeatureLinks"

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

describe("HomeFeatureLinks", () => {
  it("主要導線とAIおすすめ記事を表示する", () => {
    render(<HomeFeatureLinks />)

    expect(screen.getByRole("link", { name: /ブログ/ })).toHaveAttribute("href", "/blog")
    expect(screen.getByRole("link", { name: /ポッドキャスト/ })).toHaveAttribute("href", "/podcast")
    expect(screen.getByRole("heading", { name: "おすすめ記事" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /言葉は本当に本心を表しているのか/ })).toHaveAttribute(
      "href",
      "/blog/7149ji78dg2w",
    )
  })
})
