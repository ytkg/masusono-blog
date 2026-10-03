import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ContentItemCard from "./ContentItemCard"

vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLinkWithoutPrefetch } = await import("@/test/inertiaLinkMocks")
  return {
    Link: MockInertiaLinkWithoutPrefetch,
  }
})

describe("ContentItemCard", () => {
  it("リンク付きタイトルと本文を描画する", () => {
    render(
      <ContentItemCard title="記事タイトル" titleTo="/blog/1">
        <p>本文</p>
      </ContentItemCard>,
    )

    expect(screen.getByRole("link", { name: "記事タイトル" })).toHaveAttribute("href", "/blog/1")
    expect(screen.getByText("本文")).toBeInTheDocument()
  })

  it("リンク指定がなければ通常の見出しを描画する", () => {
    render(<ContentItemCard title="第2回">内容</ContentItemCard>)

    expect(screen.getByText("第2回")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "第2回", level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
