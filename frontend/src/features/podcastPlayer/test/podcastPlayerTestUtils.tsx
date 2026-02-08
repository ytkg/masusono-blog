import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { MemoryRouter } from "react-router-dom"
import type { MemoryRouterProps } from "react-router-dom"
import { vi } from "vitest"
import { PodcastPlayerProvider } from "@/features/podcastPlayer/PodcastPlayerContext"

interface RenderWithPodcastPlayerRouterOptions {
  initialEntries?: MemoryRouterProps["initialEntries"]
}

export function renderWithPodcastPlayerProvider(ui: ReactElement) {
  return render(<PodcastPlayerProvider>{ui}</PodcastPlayerProvider>)
}

export function renderWithPodcastPlayerRouter(
  ui: ReactElement,
  { initialEntries = ["/"] }: RenderWithPodcastPlayerRouterOptions = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PodcastPlayerProvider>{ui}</PodcastPlayerProvider>
    </MemoryRouter>,
  )
}

export function mockAudioPlaybackEvents() {
  const playSpy = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event("play"))
    return Promise.resolve()
  })
  const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event("pause"))
  })
  return { playSpy, pauseSpy }
}

export function mockAudioPlayRejected(message = "blocked") {
  return vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new Error(message))
}

export function mockToggleableAudioPlayback() {
  const pausedState = new WeakMap<HTMLMediaElement, boolean>()
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(function (this: HTMLMediaElement) {
    return pausedState.get(this) ?? true
  })
  const playSpy = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    pausedState.set(this, false)
    this.dispatchEvent(new Event("play"))
    return Promise.resolve()
  })
  const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    pausedState.set(this, true)
    this.dispatchEvent(new Event("pause"))
  })
  return { playSpy, pauseSpy }
}
