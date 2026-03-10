import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import PodcastEpisodesList from "./PodcastEpisodesList"

vi.mock("./PodcastEpisodeCard", () => ({
  default: ({ episode }) => <div>{episode.title}</div>,
}))

describe("PodcastEpisodesList", () => {
  it("エピソードがなければ空状態を表示する", () => {
    render(<PodcastEpisodesList episodes={[]} />)

    expect(screen.getByText("エピソードがありません。")).toBeInTheDocument()
  })

  it("エピソード一覧を描画する", () => {
    render(
      <PodcastEpisodesList
        episodes={[
          { id: "1", title: "回1" },
          { id: "2", title: "回2" },
        ]}
      />,
    )

    expect(screen.getByText("回1")).toBeInTheDocument()
    expect(screen.getByText("回2")).toBeInTheDocument()
  })
})
