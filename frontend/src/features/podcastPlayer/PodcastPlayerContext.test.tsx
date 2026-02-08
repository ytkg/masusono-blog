import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { PodcastPlayerProvider, usePodcastPlayer } from "./PodcastPlayerContext"

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
      <button type="button" onClick={() => player.setEpisodeVisibility(episode.id, true)}>
        visible-on
      </button>
      <button type="button" onClick={() => player.stop()}>
        stop
      </button>

      <output data-testid="current-episode">{player.currentEpisode?.id ?? ""}</output>
      <output data-testid="is-playing">{String(player.isPlaying)}</output>
      <output data-testid="status">{player.status}</output>
      <output data-testid="error">{player.error ?? ""}</output>
      <output data-testid="current-time">{String(player.currentTime)}</output>
      <output data-testid="visible-ids">{Array.from(player.visibleEpisodeIds).join(",")}</output>
    </div>
  )
}

function renderProvider() {
  const utils = render(
    <PodcastPlayerProvider>
      <Probe />
    </PodcastPlayerProvider>,
  )
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
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })

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
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("blocked"))

    renderProvider()

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error")
      expect(screen.getByTestId("is-playing")).toHaveTextContent("false")
      expect(screen.getByTestId("error")).toHaveTextContent("blocked")
    })
  })

  it("togglePlayPauseでpause/playを切り替える", async () => {
    const pausedState = new WeakMap<HTMLMediaElement, boolean>()
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(function (this: HTMLMediaElement) {
      return pausedState.get(this) ?? true
    })
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      pausedState.set(this, false)
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      pausedState.set(this, true)
      this.dispatchEvent(new Event("pause"))
    })

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

    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })

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

  it("stopで再生状態と可視IDを初期化する", async () => {
    const pausedState = new WeakMap<HTMLMediaElement, boolean>()
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(function (this: HTMLMediaElement) {
      return pausedState.get(this) ?? true
    })
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      pausedState.set(this, false)
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      pausedState.set(this, true)
      this.dispatchEvent(new Event("pause"))
    })
    const loadSpy = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {})

    renderProvider()

    fireEvent.click(screen.getByRole("button", { name: "play-episode" }))
    await waitFor(() => {
      expect(screen.getByTestId("current-episode")).toHaveTextContent("001")
    })
    fireEvent.click(screen.getByRole("button", { name: "visible-on" }))
    expect(screen.getByTestId("visible-ids")).toHaveTextContent("001")

    fireEvent.click(screen.getByRole("button", { name: "stop" }))

    await waitFor(() => {
      expect(screen.getByTestId("current-episode")).toHaveTextContent("")
      expect(screen.getByTestId("is-playing")).toHaveTextContent("false")
      expect(screen.getByTestId("status")).toHaveTextContent("idle")
      expect(screen.getByTestId("current-time")).toHaveTextContent("0")
      expect(screen.getByTestId("visible-ids")).toHaveTextContent("")
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
