import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, type MockedFunction, vi } from "vitest"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

vi.mock("@/features/podcastPlayer/PodcastPlayerContext", () => ({
  usePodcastPlayer: vi.fn(),
}))

vi.mock("./PodcastAudioPlayer", () => ({
  default: ({ onTogglePlayback }: { onTogglePlayback: () => void }) => (
    <button type="button" onClick={onTogglePlayback}>
      playback-toggle
    </button>
  ),
}))

const usePodcastPlayerMock = usePodcastPlayer as unknown as MockedFunction<typeof usePodcastPlayer>

const episode: PodcastEpisode = {
  id: "001",
  title: "テストエピソード",
  publishedDate: "2026/02/08",
  audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
}

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

  it("再生中でないエピソードの操作で playEpisode を呼ぶ", () => {
    const playEpisode = vi.fn()
    const togglePlayPause = vi.fn()
    usePodcastPlayerMock.mockReturnValue(createPlayerMock({ playEpisode, togglePlayPause }))

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: "playback-toggle" }))

    expect(playEpisode).toHaveBeenCalledWith(episode)
    expect(togglePlayPause).not.toHaveBeenCalled()
  })

  it("現在のエピソード操作で togglePlayPause を呼ぶ", () => {
    const playEpisode = vi.fn()
    const togglePlayPause = vi.fn()
    usePodcastPlayerMock.mockReturnValue(
      createPlayerMock({
        currentEpisode: { ...episode },
        playEpisode,
        togglePlayPause,
      }),
    )

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: "playback-toggle" }))

    expect(togglePlayPause).toHaveBeenCalled()
    expect(playEpisode).not.toHaveBeenCalled()
  })
})
