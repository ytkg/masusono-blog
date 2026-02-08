import { act, render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, type MockedFunction, vi } from "vitest"
import type { PodcastEpisode } from "@/types/podcast"
import { usePodcastPlayer } from "@/features/podcastPlayer/PodcastPlayerContext"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

vi.mock("@/features/podcastPlayer/PodcastPlayerContext", () => ({
  usePodcastPlayer: vi.fn(),
}))

vi.mock("./PodcastAudioPlayer", () => ({
  default: () => <div data-testid="podcast-audio-player" />,
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
    visibleEpisodeIds: new Set<string>(),
    playEpisode: vi.fn(),
    togglePlayPause: vi.fn(),
    seekTo: vi.fn(),
    seekBy: vi.fn(),
    stop: vi.fn(),
    setEpisodeVisibility: vi.fn(),
    ...overrides,
  } as ReturnType<typeof usePodcastPlayer>
}

describe("PodcastEpisodeCard visibility", () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver

  afterEach(() => {
    vi.clearAllMocks()
    if (originalIntersectionObserver) {
      globalThis.IntersectionObserver = originalIntersectionObserver
    } else {
      delete (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver
    }
  })

  it("IntersectionObserverがない場合はfallbackで可視trueを設定し、unmountでfalseに戻す", () => {
    const setEpisodeVisibility = vi.fn()
    usePodcastPlayerMock.mockReturnValue(
      createPlayerMock({
        currentEpisode: { ...episode },
        setEpisodeVisibility,
      }),
    )
    delete (globalThis as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver

    const { unmount } = render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    expect(setEpisodeVisibility).toHaveBeenCalledWith("001", true)

    unmount()
    expect(setEpisodeVisibility).toHaveBeenLastCalledWith("001", false)
  })

  it("IntersectionObserverで可視状態の変化を反映し、unmount時にdisconnectする", () => {
    const setEpisodeVisibility = vi.fn()
    usePodcastPlayerMock.mockReturnValue(
      createPlayerMock({
        currentEpisode: { ...episode },
        setEpisodeVisibility,
      }),
    )

    let callback: IntersectionObserverCallback | null = null
    const observe = vi.fn()
    const disconnect = vi.fn()
    class IntersectionObserverMock implements IntersectionObserver {
      readonly root = null
      readonly rootMargin = "0px"
      readonly thresholds = [0, 0.1, 0.5, 1]

      constructor(cb: IntersectionObserverCallback) {
        callback = cb
      }

      disconnect = disconnect
      observe = observe
      unobserve = vi.fn()
      takeRecords = vi.fn(() => [])
    }

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock)

    const { unmount } = render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    expect(observe).toHaveBeenCalled()
    expect(callback).toBeTruthy()

    act(() => {
      callback?.(
        [{ isIntersecting: true, intersectionRatio: 0.5 } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    act(() => {
      callback?.(
        [{ isIntersecting: false, intersectionRatio: 0 } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(setEpisodeVisibility).toHaveBeenCalledWith("001", true)
    expect(setEpisodeVisibility).toHaveBeenCalledWith("001", false)

    unmount()

    expect(disconnect).toHaveBeenCalled()
    expect(setEpisodeVisibility).toHaveBeenLastCalledWith("001", false)
  })

  it("再生中でないエピソードでは可視falseを設定し、Observerを作成しない", () => {
    const setEpisodeVisibility = vi.fn()
    const ioMock = vi.fn()
    class IntersectionObserverMock implements IntersectionObserver {
      readonly root = null
      readonly rootMargin = "0px"
      readonly thresholds = [0]

      constructor(_cb: IntersectionObserverCallback) {
        ioMock()
      }

      disconnect = vi.fn()
      observe = vi.fn()
      unobserve = vi.fn()
      takeRecords = vi.fn(() => [])
    }
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock)

    usePodcastPlayerMock.mockReturnValue(
      createPlayerMock({
        currentEpisode: { ...episode, id: "other" },
        setEpisodeVisibility,
      }),
    )

    render(
      <MemoryRouter>
        <PodcastEpisodeCard episode={episode} />
      </MemoryRouter>,
    )

    expect(setEpisodeVisibility).toHaveBeenCalledWith("001", false)
    expect(ioMock).not.toHaveBeenCalled()
  })
})
