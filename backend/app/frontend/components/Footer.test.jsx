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
    vi.mocked(usePage).mockReturnValue({ url: "/?page=1" })

    render(<Footer />)

    expect(screen.getByText("ホーム").closest("a")).toHaveAttribute("href", "/")
    expect(screen.getByText("検索").closest("a")).toHaveAttribute("href", "/search")
    expect(screen.getByText("著者").closest("a")).toHaveAttribute("href", "/authors")
    expect(screen.getByText("数字").closest("a")).toHaveAttribute("href", "/numbers")
    expect(screen.getByText("その他！").closest("a")).toHaveAttribute("href", "/others")
    expect(screen.queryByText("ブログ")).not.toBeInTheDocument()
    expect(screen.getByText("ホーム").closest(".Mui-selected")).not.toBeNull()
    expect(screen.getByText(`© ${new Date().getFullYear()} 増田とその他！`)).toBeInTheDocument()
  })

  it("フッター上部の区切り線を表示する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/" })

    const { container } = render(<Footer />)

    expect(container.querySelector("footer")).toHaveStyle({ borderTopStyle: "solid" })
  })

  it("検索タブを著者タブより左に表示する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/" })

    render(<Footer />)

    expect(screen.getByText("検索").compareDocumentPosition(screen.getByText("著者"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it("検索ページでは検索タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/search?q=増田" })

    render(<Footer />)

    expect(screen.getByText("検索").closest(".Mui-selected")).not.toBeNull()
  })

  it("著者ページでは著者タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/authors" })

    render(<Footer />)

    expect(screen.getByText("著者").closest(".Mui-selected")).not.toBeNull()
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
