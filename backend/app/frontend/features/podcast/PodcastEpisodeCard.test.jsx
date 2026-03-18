import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePodcastPlayer } from "../podcastPlayer/usePodcastPlayer"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

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

vi.mock("../podcastPlayer/usePodcastPlayer", () => ({
  usePodcastPlayer: vi.fn(),
}))

describe("PodcastEpisodeCard", () => {
  it("episode がない場合は案内を表示する", () => {
    vi.mocked(usePodcastPlayer).mockReturnValue({
      currentEpisode: null,
      isPlaying: false,
      isPlaybackActive: false,
      playEpisode: vi.fn(),
      stop: vi.fn(),
    })

    render(<PodcastEpisodeCard episode={null} />)

    expect(screen.getByText("エピソードが見つかりません。")).toBeInTheDocument()
  })

  it("非再生時は playEpisode を呼ぶ", () => {
    const playEpisode = vi.fn()
    vi.mocked(usePodcastPlayer).mockReturnValue({
      currentEpisode: null,
      isPlaying: false,
      isPlaybackActive: false,
      playEpisode,
      stop: vi.fn(),
    })
    const episode = {
      id: "001",
      title: "第1回",
      publishedDate: "2026/03/09",
    }

    render(<PodcastEpisodeCard episode={episode} />)
    fireEvent.click(screen.getByRole("button", { name: "再生" }))

    expect(playEpisode).toHaveBeenCalledWith(episode)
  })

  it("現在再生中なら stop を呼ぶ", () => {
    const stop = vi.fn()
    vi.mocked(usePodcastPlayer).mockReturnValue({
      currentEpisode: { id: "001" },
      isPlaying: true,
      isPlaybackActive: true,
      playEpisode: vi.fn(),
      stop,
    })

    render(<PodcastEpisodeCard episode={{ id: "001", title: "第1回", publishedDate: "2026/03/09" }} />)
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }))

    expect(stop).toHaveBeenCalledTimes(1)
  })

  it("loading 中の現在エピソードなら stop を呼ぶ", () => {
    const stop = vi.fn()
    vi.mocked(usePodcastPlayer).mockReturnValue({
      currentEpisode: { id: "001" },
      isPlaying: false,
      isPlaybackActive: true,
      playEpisode: vi.fn(),
      stop,
    })

    render(<PodcastEpisodeCard episode={{ id: "001", title: "第1回", publishedDate: "2026/03/09" }} />)
    fireEvent.click(screen.getByRole("button", { name: "一時停止" }))

    expect(stop).toHaveBeenCalledTimes(1)
  })
})
