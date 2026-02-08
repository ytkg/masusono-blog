import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, type MockedFunction, vi } from "vitest"
import type { PodcastEpisode } from "@/types/podcast"
import { usePodcast } from "./usePodcast"
import { usePodcasts } from "./usePodcasts"

vi.mock("./usePodcasts", () => ({
  usePodcasts: vi.fn(),
}))

const usePodcastsMock = usePodcasts as unknown as MockedFunction<typeof usePodcasts>

const createUsePodcastsResult = (overrides: Partial<ReturnType<typeof usePodcasts>> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  }) as ReturnType<typeof usePodcasts>

const fallbackEpisode: PodcastEpisode = {
  id: "fallback",
  title: "fallback episode",
  publishedDate: "2026/02/08",
  audioUrl: "https://storage.googleapis.com/masusono-podcast/fallback.mp3",
}

describe("usePodcast", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("idがない場合はfallbackを返し、loadingをfalseにする", () => {
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ isLoading: true }))

    const { result } = renderHook(() => usePodcast(undefined, fallbackEpisode))

    expect(result.current.data).toEqual(fallbackEpisode)
    expect(result.current.isLoading).toBe(false)
  })

  it("idに一致するエピソードがある場合は該当データを返す", () => {
    const episode: PodcastEpisode = {
      id: "001",
      title: "episode 1",
      publishedDate: "2026/02/08",
      audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
    }
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ data: [episode] }))

    const { result } = renderHook(() => usePodcast("001"))

    expect(result.current.data).toEqual(episode)
    expect(result.current.error).toBeUndefined()
  })

  it("エピソードが見つからない場合でもfallbackがあればfallbackを返す", () => {
    const episode: PodcastEpisode = {
      id: "001",
      title: "episode 1",
      publishedDate: "2026/02/08",
      audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
    }
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ data: [episode] }))

    const { result } = renderHook(() => usePodcast("missing", fallbackEpisode))

    expect(result.current.data).toEqual(fallbackEpisode)
    expect(result.current.error).toBeUndefined()
  })

  it("id指定かつエピソードが見つからない場合はnot foundエラーを返す", () => {
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ data: [] }))

    const { result } = renderHook(() => usePodcast("missing"))

    expect(result.current.data).toBeUndefined()
    expect(result.current.error?.message).toBe("エピソードが見つかりません。")
  })

  it("SWRエラーがある場合はそちらを優先する", () => {
    const swrError = new Error("network error")
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ data: [], error: swrError }))

    const { result } = renderHook(() => usePodcast("missing"))

    expect(result.current.error).toBe(swrError)
  })
})
