import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Podcast from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title }) => <div>seo:{title}</div>,
}))

vi.mock("../../features/podcast/PodcastEpisodesList", () => ({
  default: ({ episodes }) => <div>episodes:{episodes.length}</div>,
}))

describe("Podcast page", () => {
  it("一覧ヘッダとエピソード一覧を描画する", () => {
    render(<Podcast episodes={[{ id: "1" }]} />)

    expect(screen.getByText("seo:ポッドキャスト")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "ポッドキャスト" })).toBeInTheDocument()
    expect(screen.getByText("episodes:1")).toBeInTheDocument()
  })
})
