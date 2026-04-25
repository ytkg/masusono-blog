import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Blog from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title }) => <div>seo:{title}</div>,
}))

describe("Blog page", () => {
  it("一覧ヘッダと記事一覧を描画する", () => {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })

    render(
      <Blog
        articles={[
          { id: "a1", title: "記事1", author: "増田", publishedDate: "2025/10/01", content: "<p>本文1</p>" },
          { id: "a2", title: "記事2", author: "その他1", publishedDate: "2025/09/01", content: "<p>本文2</p>" },
        ]}
      />,
    )

    expect(screen.getByText("seo:ブログ")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "絞り込みを開く" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "記事1" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "記事2" })).toBeInTheDocument()
  })

  it("記事がなければフィルタを出さず空状態を渡す", () => {
    render(<Blog articles={[]} />)

    expect(screen.queryByRole("button", { name: "絞り込みを開く" })).not.toBeInTheDocument()
    expect(screen.getByText("記事がありません。")).toBeInTheDocument()
  })

  it("著者を選ぶと年月側の件数も更新される", () => {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })

    render(
      <Blog
        articles={[
          { id: "a1", title: "記事1", author: "増田", publishedDate: "2025/10/01", content: "<p>本文1</p>" },
          { id: "a2", title: "記事2", author: "増田", publishedDate: "2025/09/01", content: "<p>本文2</p>" },
          { id: "a3", title: "記事3", author: "その他1", publishedDate: "2025/09/15", content: "<p>本文3</p>" },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))
    expect(screen.getByRole("button", { name: "年月: すべて (3)" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "増田 (2)" }))

    expect(screen.getByRole("button", { name: "年月: すべて (2)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2025/10 (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2025/09 (1)" })).toBeInTheDocument()
  })

  it("年月を選ぶと著者側の件数も更新される", () => {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })

    render(
      <Blog
        articles={[
          { id: "a1", title: "記事1", author: "増田", publishedDate: "2025/10/01", content: "<p>本文1</p>" },
          { id: "a2", title: "記事2", author: "増田", publishedDate: "2025/09/01", content: "<p>本文2</p>" },
          { id: "a3", title: "記事3", author: "その他1", publishedDate: "2025/09/15", content: "<p>本文3</p>" },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))
    expect(screen.getByRole("button", { name: "著者: すべて (3)" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "2025/10 (1)" }))

    expect(screen.getByRole("button", { name: "著者: すべて (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "増田 (1)" })).toBeInTheDocument()
    expect(screen.getByText("その他1 (0)")).toBeInTheDocument()
    expect(screen.getByText("その他1 (0)").closest(".MuiChip-root")).toHaveClass("Mui-disabled")
  })

  it("著者を選んでも年月ラベルは減らず、0件は残る", () => {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })

    render(
      <Blog
        articles={[
          { id: "a1", title: "記事1", author: "増田", publishedDate: "2025/10/01", content: "<p>本文1</p>" },
          { id: "a2", title: "記事2", author: "増田", publishedDate: "2025/09/01", content: "<p>本文2</p>" },
          { id: "a3", title: "記事3", author: "その他1", publishedDate: "2025/08/15", content: "<p>本文3</p>" },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))
    fireEvent.click(screen.getByRole("button", { name: "その他1 (1)" }))

    expect(screen.getByRole("button", { name: "年月: すべて (1)" })).toBeInTheDocument()
    expect(screen.getByText("2025/10 (0)")).toBeInTheDocument()
    expect(screen.getByText("2025/09 (0)")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2025/08 (1)" })).toBeInTheDocument()
    expect(screen.getByText("2025/10 (0)").closest(".MuiChip-root")).toHaveClass("Mui-disabled")
    expect(screen.getByText("2025/09 (0)").closest(".MuiChip-root")).toHaveClass("Mui-disabled")
  })
})
