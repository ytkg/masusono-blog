import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Header from "./Header"

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

vi.mock("../assets/logo.png", () => ({
  default: "/mock-logo.png",
}))

describe("Header", () => {
  it("ホームへのリンク付きロゴを表示する", () => {
    render(<Header />)

    const image = screen.getByRole("img", { name: "増田とその他！" })
    expect(image).toHaveAttribute("src", "/mock-logo.png")
    expect(image.closest("a")).toHaveAttribute("href", "/")
  })
})
