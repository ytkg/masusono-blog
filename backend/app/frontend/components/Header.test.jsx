import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Header from "./Header"
import { usePage } from "@inertiajs/react"
import { LOCATION_CHANGE_EVENT } from "@/shared/lib/locationEvents"

vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    Link: React.forwardRef(function MockLink({ href, prefetch, cacheFor, children, ...props }, ref) {
      return (
        <a
          ref={ref}
          href={href}
          data-prefetch={JSON.stringify(prefetch)}
          data-cache-for={JSON.stringify(cacheFor)}
          {...props}
        >
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
    expect(image.closest("a")).toHaveAttribute("data-prefetch", "false")
  })

  it("別ページではロゴからホームを先読みし、期限後もキャッシュを表示して更新する", () => {
    vi.mocked(usePage).mockReturnValueOnce({ url: "/authors" })
    render(<Header />)
    const link = screen.getByRole("img", { name: "増田とその他！" }).closest("a")
    expect(link).toHaveAttribute("data-prefetch", '["hover","mount"]')
    expect(link).toHaveAttribute("data-cache-for", '["30s","5m"]')
  })

  it("移動先のパスが変わった場合だけホームリンクの表示時先読みを再実行する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/authors" })
    const { rerender } = render(<Header />)
    const previousLink = screen.getByRole("img", { name: "増田とその他！" }).closest("a")

    rerender(<Header />)
    expect(screen.getByRole("img", { name: "増田とその他！" }).closest("a")).toBe(previousLink)

    vi.mocked(usePage).mockReturnValue({ url: "/numbers" })
    rerender(<Header />)
    expect(screen.getByRole("img", { name: "増田とその他！" }).closest("a")).not.toBe(previousLink)
    vi.mocked(usePage).mockReturnValue({ url: "/" })
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

  it("検索結果ページでは戻るボタンを表示する", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/search?q=%23%E8%AA%AD%E6%9B%B8" })

    render(<Header />)

    expect(screen.getByRole("button", { name: "前のページに戻る" })).toBeInTheDocument()
  })

  it("検索候補ページでは戻るボタンを表示しない", () => {
    vi.mocked(usePage).mockReturnValue({ url: "/search" })

    render(<Header />)

    expect(screen.queryByRole("button", { name: "前のページに戻る" })).not.toBeInTheDocument()
  })

  it("検索ページ内でURLが検索結果に変わったら戻るボタンを表示する", async () => {
    vi.mocked(usePage).mockReturnValue({ url: "/search" })
    window.history.replaceState(null, "", "/search")

    render(<Header />)

    expect(screen.queryByRole("button", { name: "前のページに戻る" })).not.toBeInTheDocument()

    window.history.pushState(null, "", "/search?q=%23%E8%AA%AD%E6%9B%B8")
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "前のページに戻る" })).toBeInTheDocument()
    })
  })

  it("ヘッダー右側に設定リンクを表示しない", () => {
    render(<Header />)

    expect(screen.queryByRole("link", { name: "設定を開く" })).not.toBeInTheDocument()
  })
})
