import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PodcastPlayerProvider } from "./PodcastPlayerContext.jsx"

vi.mock("./hooks/usePodcastPlayerController", () => ({
  usePodcastPlayerController: vi.fn().mockReturnValue({
    audioRef: { current: null },
    value: { currentEpisode: null, isPlaying: false },
  }),
}))

describe("PodcastPlayerProvider", () => {
  it("context provider と非表示 audio を配置する", () => {
    render(
      <PodcastPlayerProvider>
        <div>child</div>
      </PodcastPlayerProvider>,
    )

    expect(screen.getByText("child")).toBeInTheDocument()
    expect(document.querySelector("audio[preload='metadata']")).not.toBeNull()
  })
})
