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
    expect(screen.getByText("数字").closest("a")).toHaveAttribute("href", "/numbers")
    expect(screen.getByText("その他！").closest("a")).toHaveAttribute("href", "/others")
    expect(screen.getByText("ブログ").closest(".Mui-selected")).not.toBeNull()
    expect(screen.getByText(`© ${new Date().getFullYear()} 増田とその他！`)).toBeInTheDocument()
  })

  it("図鑑ページでは図鑑タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/zukan" })

    render(<Footer />)

    expect(screen.getByText("図鑑").closest(".Mui-selected")).not.toBeNull()
  })

  it("数字ページでは数字タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/numbers" })

    render(<Footer />)

    expect(screen.getByText("数字").closest(".Mui-selected")).not.toBeNull()
  })

  it("その他ページではその他タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/others" })

    render(<Footer />)

    expect(screen.getByText("その他！").closest(".Mui-selected")).not.toBeNull()
  })
})
