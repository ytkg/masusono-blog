import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
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

vi.mock("../assets/logo.webp", () => ({
  default: "/mock-logo.png",
}))

describe("Header", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("ホームへのリンク付きロゴを表示する", () => {
    render(<Header />)

    const image = screen.getByRole("img", { name: "増田とその他！" })
    expect(image).toHaveAttribute("src", "/mock-logo.png")
    expect(image.closest("a")).toHaveAttribute("href", "/")
  })

  it("ヘッダー左側に日付のみ表示する", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-09T12:34:56+09:00"))

    render(<Header />)

    expect(screen.getByText("03/09")).toBeInTheDocument()
    expect(screen.getByText("MON")).toBeInTheDocument()
    expect(screen.queryByText(/12:34:56/)).not.toBeInTheDocument()
  })

  it("日付表示はパス情報に依存しない", () => {
    render(<Header />)

    expect(screen.getByText(/\d{2}\/\d{2}/)).toBeInTheDocument()
  })
})
