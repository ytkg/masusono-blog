import { render, screen } from "@testing-library/react"
import { usePage } from "@inertiajs/react"
import { describe, expect, it, vi } from "vitest"
import Footer from "./Footer"

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
    usePage: vi.fn(),
  }
})

describe("Footer", () => {
  it("タブとコピーライトを表示し、現在パスに応じてタブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/blog/article-1?page=1" })

    render(<Footer />)

    expect(screen.getByText("ホーム").closest("a")).toHaveAttribute("href", "/")
    expect(screen.getByText("図鑑").closest("a")).toHaveAttribute("href", "/zukan")
    expect(screen.queryByText("設定")).not.toBeInTheDocument()
    expect(screen.getByText("ブログ").closest(".Mui-selected")).not.toBeNull()
    expect(screen.getByText(`© ${new Date().getFullYear()} 増田とその他！`)).toBeInTheDocument()
  })

  it("設定ページではホームタブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/settings" })

    render(<Footer />)

    expect(screen.getByText("ホーム").closest(".Mui-selected")).not.toBeNull()
  })

  it("図鑑ページでは図鑑タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/zukan" })

    render(<Footer />)

    expect(screen.getByText("図鑑").closest(".Mui-selected")).not.toBeNull()
  })
})
