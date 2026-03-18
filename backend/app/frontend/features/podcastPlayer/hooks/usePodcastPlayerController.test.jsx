import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePodcastPlayerAudioEvents } from "./usePodcastPlayerAudioEvents"
import { usePodcastPlayerController } from "./usePodcastPlayerController"

vi.mock("./usePodcastPlayerAudioEvents", () => ({
  usePodcastPlayerAudioEvents: vi.fn(),
}))

function buildAudio(overrides = {}) {
  return {
    src: "",
    currentTime: 5,
    duration: 90,
    paused: true,
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    ...overrides,
  }
}

describe("usePodcastPlayerController", () => {
  it("audio event hook を登録し、playEpisode で音源を差し替える", async () => {
    const { result } = renderHook(() => usePodcastPlayerController())
    const audio = buildAudio()
    const episode = { id: "ep-1", title: "第1回", audioUrl: "https://example.com/ep-1.mp3" }
    result.current.audioRef.current = audio

    expect(usePodcastPlayerAudioEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        audioRef: result.current.audioRef,
        onLoadedMetadata: expect.any(Function),
        onTimeUpdate: expect.any(Function),
      }),
    )

    await act(async () => {
      await result.current.value.playEpisode(episode)
    })

    expect(audio.src).toBe("https://example.com/ep-1.mp3")
    expect(audio.currentTime).toBe(0)
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(result.current.value.currentEpisode).toEqual(episode)
    expect(result.current.value.status).toBe("loading")
  })

  it("再生失敗時は error state にする", async () => {
    const { result } = renderHook(() => usePodcastPlayerController())
    result.current.audioRef.current = buildAudio({
      play: vi.fn().mockRejectedValue(new Error("autoplay blocked")),
    })

    await act(async () => {
      await result.current.value.playEpisode({ id: "ep-1", title: "第1回", audioUrl: "https://example.com/ep-1.mp3" })
    })

    expect(result.current.value.status).toBe("error")
    expect(result.current.value.error).toBe("autoplay blocked")
  })

  it("AbortError は即 error state にしない", async () => {
    const { result } = renderHook(() => usePodcastPlayerController())
    result.current.audioRef.current = buildAudio({
      play: vi.fn().mockRejectedValue(new DOMException("The operation was aborted.", "AbortError")),
    })

    await act(async () => {
      await result.current.value.playEpisode({ id: "ep-1", title: "第1回", audioUrl: "https://example.com/ep-1.mp3" })
    })

    expect(result.current.value.status).toBe("ready")
    expect(result.current.value.error).toBeNull()
    expect(result.current.value.isPlaybackActive).toBe(false)
  })

  it("toggle、seek、stop を audio に反映する", async () => {
    const { result } = renderHook(() => usePodcastPlayerController())
    const audio = buildAudio()
    result.current.audioRef.current = audio

    await act(async () => {
      await result.current.value.playEpisode({ id: "ep-1", title: "第1回", audioUrl: "https://example.com/ep-1.mp3" })
    })

    audio.paused = false
    act(() => {
      result.current.value.togglePlayPause()
    })
    expect(audio.pause).toHaveBeenCalledTimes(1)

    audio.currentTime = 20
    act(() => {
      result.current.value.seekBy(100)
    })
    expect(audio.currentTime).toBe(90)

    act(() => {
      result.current.value.stop()
    })
    expect(audio.pause).toHaveBeenCalledTimes(2)
  })
})
