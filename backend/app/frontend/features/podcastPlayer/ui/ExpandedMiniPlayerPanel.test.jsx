import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ExpandedMiniPlayerPanel from "./ExpandedMiniPlayerPanel"

vi.mock("./PodcastAudioPlayer", () => ({
  default: ({ title }) => <div>player:{title}</div>,
}))

describe("ExpandedMiniPlayerPanel", () => {
  it("閉じると縮小の操作を渡す", () => {
    const onCollapse = vi.fn()
    const onClose = vi.fn()

    render(
      <ExpandedMiniPlayerPanel
        title="第1回"
        isPlaying={false}
        currentTime={0}
        duration={0}
        onTogglePlayPause={vi.fn()}
        onSeekBy={vi.fn()}
        onSeekTo={vi.fn()}
        onCollapse={onCollapse}
        onClose={onClose}
      />,
    )

    expect(screen.getByText("player:第1回")).toBeInTheDocument()

    const closeButton = screen.getByRole("button", { name: "ミニプレイヤーを閉じる" })
    const collapseButton = screen.getByRole("button", { name: "ミニプレイヤーを縮小" })

    fireEvent.click(closeButton)
    fireEvent.keyDown(closeButton, { key: "Enter" })
    fireEvent.click(collapseButton)
    fireEvent.keyDown(collapseButton, { key: " " })

    expect(onClose).toHaveBeenCalledTimes(2)
    expect(onCollapse).toHaveBeenCalledTimes(2)
  })
})
