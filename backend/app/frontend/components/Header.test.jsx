import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Header from "./Header"
import { usePage } from "@inertiajs/react"

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
    usePage: vi.fn(() => ({ url: "/" })),
  }
})

vi.mock("../assets/logo.webp", () => ({
  default: "/mock-logo.png",
}))

describe("Header", () => {
  it("ホームへのリンク付きロゴを表示する", () => {
    render(<Header />)

    const image = screen.getByRole("img", { name: "増田とその他！" })
    expect(image).toHaveAttribute("src", "/mock-logo.png")
    expect(image.closest("a")).toHaveAttribute("href", "/")
  })

  it("通常ページでは戻るボタンを表示しない", () => {
    render(<Header />)

    expect(screen.queryByRole("button", { name: "前のページに戻る" })).not.toBeInTheDocument()
    expect(screen.queryByText(/\d{2}\/\d{2}/)).not.toBeInTheDocument()
  })

  it("トップページでも検索ボタンを表示しない", () => {
    render(<Header />)

    expect(screen.queryByRole("link", { name: "記事を検索" })).not.toBeInTheDocument()
  })

  it("個別記事ページでは戻るボタンを表示し、前のページへ戻る", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/articles/hello-world" })
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {})
    vi.spyOn(window.history, "length", "get").mockReturnValue(2)
    render(<Header />)

    fireEvent.click(screen.getByRole("button", { name: "前のページに戻る" }))

    expect(back).toHaveBeenCalledTimes(1)
    back.mockRestore()
    expect(screen.queryByRole("link", { name: "記事を検索" })).not.toBeInTheDocument()
  })

  it("著者ページでは戻るボタンを表示する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/authors/masuda" })

    render(<Header />)

    expect(screen.getByRole("button", { name: "前のページに戻る" })).toBeInTheDocument()
  })

  it("ヘッダー右側に設定リンクを表示しない", () => {
    render(<Header />)

    expect(screen.queryByRole("link", { name: "設定を開く" })).not.toBeInTheDocument()
  })
})
