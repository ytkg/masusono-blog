import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ContentItemCard from "./ContentItemCard"

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

describe("ContentItemCard", () => {
  it("metaParts を連結しリンク付きタイトルを描画する", () => {
    render(
      <ContentItemCard title="記事タイトル" titleTo="/blog/1" metaParts={["2026/03/09", "増田"]} metaSeparator=" / ">
        <p>本文</p>
      </ContentItemCard>,
    )

    expect(screen.getByRole("link", { name: "記事タイトル" })).toHaveAttribute("href", "/blog/1")
    expect(screen.getByText("2026/03/09 / 増田")).toBeInTheDocument()
    expect(screen.getByText("本文")).toBeInTheDocument()
  })

  it("メタ情報が空なら描画しない", () => {
    render(<ContentItemCard title="第2回">内容</ContentItemCard>)

    expect(screen.getByText("第2回")).toBeInTheDocument()
    expect(screen.queryByText(" / ")).not.toBeInTheDocument()
  })
})
