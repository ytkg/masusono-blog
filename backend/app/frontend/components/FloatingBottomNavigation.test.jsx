import { render, screen } from "@testing-library/react"
import { usePage } from "@inertiajs/react"
import { describe, expect, it, vi } from "vitest"
import FloatingBottomNavigation from "./FloatingBottomNavigation"

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

describe("FloatingBottomNavigation", () => {
  it("タブを表示し、現在パスに応じてタブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/?page=1" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("ホーム").closest("a")).toHaveAttribute("href", "/")
    expect(screen.getByText("検索").closest("a")).toHaveAttribute("href", "/search")
    expect(screen.getByText("著者").closest("a")).toHaveAttribute("href", "/authors")
    expect(screen.getByText("数字").closest("a")).toHaveAttribute("href", "/numbers")
    expect(screen.getByText("その他！").closest("a")).toHaveAttribute("href", "/others")
    expect(screen.queryByText("ブログ")).not.toBeInTheDocument()
    expect(screen.getByText("ホーム").closest(".Mui-selected")).not.toBeNull()
    expect(screen.queryByText(/©/)).not.toBeInTheDocument()
    expect(screen.queryByText("増田とその他！")).not.toBeInTheDocument()
  })

  it("画面下部に固定された pill 型ナビゲーションとして表示する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/" })

    render(<FloatingBottomNavigation />)

    const navigation = screen.getByRole("navigation", { name: "メインナビゲーション" })

    expect(navigation).toHaveStyle({
      position: "fixed",
      overflow: "hidden",
    })
  })

  it("検索タブを著者タブより左に表示する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("検索").compareDocumentPosition(screen.getByText("著者"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it("検索ページでは検索タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/search?q=増田" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("検索").closest(".Mui-selected")).not.toBeNull()
  })

  it("著者ページでは著者タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/authors" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("著者").closest(".Mui-selected")).not.toBeNull()
  })

  it("著者配下以外の前方一致パスでは著者タブを選択しない", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/authors-extra" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("著者").closest(".Mui-selected")).toBeNull()
  })

  it("未定義パスではどのタブも選択しない", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/articles/post-1" })

    render(<FloatingBottomNavigation />)

    expect(document.querySelector(".Mui-selected")).toBeNull()
  })

  it("数字ページでは数字タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/numbers" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("数字").closest(".Mui-selected")).not.toBeNull()
  })

  it("その他ページではその他タブを選択する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/others" })

    render(<FloatingBottomNavigation />)

    expect(screen.getByText("その他！").closest(".Mui-selected")).not.toBeNull()
  })
})
