import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import {
  mockAudioPlaybackEvents,
  mockAudioPlayRejected,
  mockToggleableAudioPlayback,
  renderWithPodcastPlayerProvider,
} from "@/features/podcastPlayer/test/podcastPlayerTestUtils"
import { usePodcastPlayer } from "./PodcastPlayerContext"

const episode: PodcastEpisode = {
  id: "001",
  title: "テストエピソード",
  publishedDate: "2026/02/08",
  audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
}

function Probe() {
  const player = usePodcastPlayer()

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void player.playEpisode(episode)
        }}
      >
        play-episode
      </button>
      <button
        type="button"
        onClick={() => {
          void player.togglePlayPause()
        }}
      >
        toggle
      </button>
      <button type="button" onClick={() => player.seekTo(-10)}>
        seek-neg
      </button>
      <button type="button" onClick={() => player.seekTo(999)}>
        seek-over
      </button>
      <button type="button" onClick={() => player.stop()}>
        stop
      </button>

      <output data-testid="current-episode">{player.currentEpisode?.id ?? ""}</output>
      <output data-testid="is-playing">{String(player.isPlaying)}</output>
      <output data-testid="status">{player.status}</output>
      <output data-testid="error">{player.error ?? ""}</output>
      <output data-testid="current-time">{String(player.currentTime)}</output>
    </div>
  )
}

function renderProvider() {
  const utils = renderWithPodcastPlayerProvider(<Probe />)
  const audio = utils.container.querySelector("audio") as HTMLAudioElement
  if (!audio) {
    throw new Error("audio element not found")
  }
  return { ...utils, audio }
}

describe("PodcastPlayerContext", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("playEpisode成功時に再生中ステータスへ遷移する", async () => {
    mockAudioPlaybackEvents()

    renderProvider()

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))

    await waitFor(() => {
      expect(screen.getByTestId("current-episode")).toHaveTextContent("001")
      expect(screen.getByTestId("is-playing")).toHaveTextContent("true")
      expect(screen.getByTestId("status")).toHaveTextContent("ready")
      expect(screen.getByTestId("error")).toHaveTextContent("")
    })
  })

  it("playEpisode失敗時にerrorステータスへ遷移する", async () => {
    mockAudioPlayRejected("blocked")

    renderProvider()

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error")
      expect(screen.getByTestId("is-playing")).toHaveTextContent("false")
      expect(screen.getByTestId("error")).toHaveTextContent("blocked")
    })
  })

  it("togglePlayPauseでpause/playを切り替える", async () => {
    const { playSpy, pauseSpy } = mockToggleableAudioPlayback()

    renderProvider()

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))
    await waitFor(() => {
      expect(screen.getByTestId("is-playing")).toHaveTextContent("true")
    })

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    await waitFor(() => {
      expect(screen.getByTestId("is-playing")).toHaveTextContent("false")
    })
    expect(pauseSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "toggle" }))
    await waitFor(() => {
      expect(screen.getByTestId("is-playing")).toHaveTextContent("true")
    })
    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it("seekToは0〜durationにクランプされる", async () => {
    const { audio } = renderProvider()

    mockAudioPlaybackEvents()

    Object.defineProperty(audio, "duration", { value: 120, writable: true, configurable: true })
    Object.defineProperty(audio, "currentTime", { value: 0, writable: true, configurable: true })

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))
    await waitFor(() => {
      expect(screen.getByTestId("current-episode")).toHaveTextContent("001")
    })

    fireEvent.click(screen.getByRole("button", { name: "seek-over" }))
    await waitFor(() => {
      expect(screen.getByTestId("current-time")).toHaveTextContent("120")
    })

    fireEvent.click(screen.getByRole("button", { name: "seek-neg" }))
    await waitFor(() => {
      expect(screen.getByTestId("current-time")).toHaveTextContent("0")
    })
  })

  it("stopで再生状態を初期化する", async () => {
    const { pauseSpy } = mockToggleableAudioPlayback()
    const loadSpy = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})

    renderProvider()

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))
    await waitFor(() => {
      expect(screen.getByTestId("current-episode")).toHaveTextContent("001")
    })

    fireEvent.click(screen.getByRole("button", { name: "stop" }))

    await waitFor(() => {
      expect(screen.getByTestId("current-episode")).toHaveTextContent("")
      expect(screen.getByTestId("is-playing")).toHaveTextContent("false")
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
      expect(screen.getByTestId("current-time")).toHaveTextContent("0")
    })
    expect(pauseSpy).toHaveBeenCalled()
    expect(loadSpy).toHaveBeenCalled()
  })

  it("Provider外でusePodcastPlayerを呼ぶとエラーを投げる", () => {
    function InvalidProbe() {
      usePodcastPlayer()
      return null
    }

    expect(() => {
      act(() => {
        render(<InvalidProbe />)
      })
    }).toThrow("usePodcastPlayer must be used within PodcastPlayerProvider")
  })
})
