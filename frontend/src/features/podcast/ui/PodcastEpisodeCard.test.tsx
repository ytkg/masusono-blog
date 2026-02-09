import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, type MockedFunction, vi } from "vitest"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

vi.mock("@/features/podcastPlayer/PodcastPlayerContext", () => ({
  usePodcastPlayer: vi.fn(),
}))

const usePodcastPlayerMock = usePodcastPlayer as unknown as MockedFunction<typeof usePodcastPlayer>

const episode: PodcastEpisode = {
  id: "001",
  title: "テストエピソード",
  publishedDate: "2026/02/08",
  audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
}
const playButtonLabel = `再生: ${episode.title}`
const stopButtonLabel = `停止: ${episode.title}`

function createPlayerMock(overrides: Partial<ReturnType<typeof usePodcastPlayer>> = {}) {
  return {
    currentEpisode: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    status: "idle",
    error: null,
    playEpisode: vi.fn(),
    togglePlayPause: vi.fn(),
    pause: vi.fn(),
    seekTo: vi.fn(),
    seekBy: vi.fn(),
    stop: vi.fn(),
    ...overrides,
  } as ReturnType<typeof usePodcastPlayer>
}

describe("PodcastEpisodeCard", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("非再生中エピソードの再生ボタンで playEpisode を呼ぶ", () => {
    const playEpisode = vi.fn()
    usePodcastPlayerMock.mockReturnValue(createPlayerMock({ currentEpisode: { ...episode, id: "other" }, playEpisode }))

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: playButtonLabel }))

    expect(playEpisode).toHaveBeenCalledWith(episode)
    expect(screen.getByRole("button", { name: stopButtonLabel })).toBeDisabled()
  })

  it("再生中のエピソードでは停止ボタンで stop を呼ぶ", () => {
    const stop = vi.fn()
    usePodcastPlayerMock.mockReturnValue(createPlayerMock({ currentEpisode: { ...episode }, stop }))

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    const stopButton = screen.getByRole("button", { name: stopButtonLabel })
    expect(stopButton).not.toBeDisabled()

    fireEvent.click(stopButton)

    expect(stop).toHaveBeenCalled()
  })

  it("詳細モードでも操作ボタンが表示される", () => {
    usePodcastPlayerMock.mockReturnValue(createPlayerMock())

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} mode="detail" />
      </MemoryRouter>,
    )

    expect(screen.getByTestId("podcast-episode-card-actions")).toBeInTheDocument()
  })
})
