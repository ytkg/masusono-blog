import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import PodcastDetail from "./show"

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

const { seoMock } = vi.hoisted(() => ({
  seoMock: vi.fn(() => null),
}))

vi.mock("../../shared/SeoHead", () => ({
  default: seoMock,
}))

vi.mock("../../features/podcast/PodcastEpisodeCard", () => ({
  default: ({ episode, mode }) => <div>{`episode:${mode}:${episode?.title ?? "missing"}`}</div>,
}))

describe("PodcastDetail page", () => {
  it("エピソード向け SEO と戻るリンクを描画する", () => {
    render(<PodcastDetail episode={{ id: "001", title: "第1回" }} />)

    const [{ title, description, canonicalPath }] = seoMock.mock.calls[0]
    expect(title).toBe("第1回")
    expect(description).toContain("第1回")
    expect(canonicalPath).toBe("/podcast/001")
    expect(screen.getByText("episode:detail:第1回")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /エピソード一覧に戻る/ })).toHaveAttribute("href", "/podcast")
  })

  it("episode がなければ podcast 一覧 canonical に戻す", () => {
    render(<PodcastDetail episode={null} />)

    const [{ title, canonicalPath }] = seoMock.mock.calls.at(-1)
    expect(title).toBe("ポッドキャスト")
    expect(canonicalPath).toBe("/podcast")
  })
})
