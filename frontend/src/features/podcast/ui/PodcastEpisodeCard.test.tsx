import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, type MockedFunction, vi } from "vitest"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"
import { MINI_PLAYER_ARIA_LABELS } from "@/features/podcastPlayer/lib/miniPlayerA11y"
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
const playButtonLabel = MINI_PLAYER_ARIA_LABELS.play
const stopButtonLabel = MINI_PLAYER_ARIA_LABELS.pause

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
    episodeDurations: {},
    ...overrides,
  } as ReturnType<typeof usePodcastPlayer>
}

describe("PodcastEpisodeCard", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("非再生中エピソードのボタンで playEpisode を呼び、状態が再生に切り替わる", () => {
    const playEpisode = vi.fn()
    usePodcastPlayerMock.mockReturnValue(
      createPlayerMock({
        currentEpisode: { ...episode, id: "other" },
        isPlaying: false,
        playEpisode,
      }),
    )

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    const button = screen.getByRole("button", { name: playButtonLabel })
    expect(button).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(button)

    expect(playEpisode).toHaveBeenCalledWith(episode)
    expect(screen.getByText("--:--")).toBeInTheDocument()
  })

  it("再生中のエピソードではボタンが停止になり stop を呼ぶ", () => {
    const stop = vi.fn()
    usePodcastPlayerMock.mockReturnValue(
      createPlayerMock({
        currentEpisode: { ...episode },
        isPlaying: true,
        currentTime: 75,
        episodeDurations: { [episode.id]: 120 },
        stop,
      }),
    )

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    const button = screen.getByRole("button", { name: stopButtonLabel })
    expect(button).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(button)

    expect(stop).toHaveBeenCalled()
    expect(screen.getByText("02:00")).toBeInTheDocument()
  })

  it("detailモードでも操作ボタンが表示される", () => {
    usePodcastPlayerMock.mockReturnValue(createPlayerMock())

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} mode="detail" />
      </MemoryRouter>,
    )

    expect(screen.getByTestId("podcast-episode-card-actions")).toBeInTheDocument()
  })
})
