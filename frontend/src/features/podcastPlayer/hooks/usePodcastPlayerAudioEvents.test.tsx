import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePodcastPlayerAudioEvents } from "./usePodcastPlayerAudioEvents"

const eventNames = [
  "loadedmetadata",
  "timeupdate",
  "play",
  "pause",
  "ended",
  "waiting",
  "canplay",
  "error",
] as const

describe("usePodcastPlayerAudioEvents", () => {
  it("8つのAudioイベントを登録し、unmount時に同数を解除する", () => {
    const audio = document.createElement("audio")
    const audioRef = { current: audio }
    const addSpy = vi.spyOn(audio, "addEventListener")
    const removeSpy = vi.spyOn(audio, "removeEventListener")

    const { unmount } = renderHook(() =>
      usePodcastPlayerAudioEvents({
        audioRef,
        onLoadedMetadata: vi.fn(),
        onTimeUpdate: vi.fn(),
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onEnded: vi.fn(),
        onWaiting: vi.fn(),
        onCanPlay: vi.fn(),
        onError: vi.fn(),
      }),
    )

    expect(addSpy).toHaveBeenCalledTimes(eventNames.length)
    expect(addSpy.mock.calls.map(([name]) => name)).toEqual(eventNames)

    unmount()

    expect(removeSpy).toHaveBeenCalledTimes(eventNames.length)
    expect(removeSpy.mock.calls.map(([name]) => name)).toEqual(eventNames)
  })

  it("errorイベントで整形済みメッセージを返す", () => {
    const audio = document.createElement("audio")
    const audioRef = { current: audio }
    const onError = vi.fn()

    Object.defineProperty(audio, "error", {
      configurable: true,
      get: () =>
        ({
          code: 2,
          MEDIA_ERR_ABORTED: 1,
          MEDIA_ERR_NETWORK: 2,
          MEDIA_ERR_DECODE: 3,
          MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
          message: "",
        }) as MediaError,
    })

    const { unmount } = renderHook(() =>
      usePodcastPlayerAudioEvents({
        audioRef,
        onLoadedMetadata: vi.fn(),
        onTimeUpdate: vi.fn(),
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onEnded: vi.fn(),
        onWaiting: vi.fn(),
        onCanPlay: vi.fn(),
        onError,
      }),
    )

    audio.dispatchEvent(new Event("error"))

    expect(onError).toHaveBeenCalledWith("ネットワークエラーで音声を取得できませんでした。")
    unmount()
  })
})
