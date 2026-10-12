import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NotFound from "./not_found"

const { headMock } = vi.hoisted(() => ({
  headMock: vi.fn(() => null),
}))

vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLinkWithoutPrefetch } = await import("@/test/inertiaLinkMocks")
  return {
    Head: headMock,
    Link: MockInertiaLinkWithoutPrefetch,
  }
})

describe("NotFound page", () => {
  it("404 用の head と戻りリンクを描画する", () => {
    render(<NotFound />)

    const [{ children }] = headMock.mock.calls[0]
    const title = children.find((child) => child.type === "title")
    expect(title.props.children).toBe("404 Not Found | 増田とその他！")
    expect(screen.getByRole("heading", { name: "ページが見つかりません" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "ホームに戻る" })).toHaveAttribute("href", "/")
  })
})
