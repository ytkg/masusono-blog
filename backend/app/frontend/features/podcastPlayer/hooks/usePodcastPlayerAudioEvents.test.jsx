import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePodcastPlayerAudioEvents } from "./usePodcastPlayerAudioEvents"

describe("usePodcastPlayerAudioEvents", () => {
  it("audio イベントを購読しコールバックへ橋渡しする", () => {
    const listeners = {}
    const audio = {
      duration: 120,
      currentTime: 15,
      error: {
        code: 2,
        MEDIA_ERR_ABORTED: 1,
        MEDIA_ERR_NETWORK: 2,
        MEDIA_ERR_DECODE: 3,
        MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
      },
      addEventListener: vi.fn((eventName, handler) => {
        listeners[eventName] = handler
      }),
      removeEventListener: vi.fn(),
    }
    const callbacks = {
      onLoadedMetadata: vi.fn(),
      onTimeUpdate: vi.fn(),
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onEnded: vi.fn(),
      onWaiting: vi.fn(),
      onCanPlay: vi.fn(),
      onError: vi.fn(),
    }

    const { unmount } = renderHook(() =>
      usePodcastPlayerAudioEvents({
        audioRef: { current: audio },
        ...callbacks,
      }),
    )

    listeners.loadedmetadata()
    listeners.timeupdate()
    listeners.play()
    listeners.pause()
    listeners.waiting()
    listeners.canplay()
    listeners.error()
    audio.duration = Number.NaN
    listeners.ended()

    expect(callbacks.onLoadedMetadata).toHaveBeenCalledWith(120)
    expect(callbacks.onTimeUpdate).toHaveBeenCalledWith(15)
    expect(callbacks.onPlay).toHaveBeenCalledTimes(1)
    expect(callbacks.onPause).toHaveBeenCalledTimes(1)
    expect(callbacks.onWaiting).toHaveBeenCalledTimes(1)
    expect(callbacks.onCanPlay).toHaveBeenCalledTimes(1)
    expect(callbacks.onError).toHaveBeenCalledWith("ネットワークエラーで音声を取得できませんでした。")
    expect(callbacks.onEnded).toHaveBeenCalledWith(0)

    unmount()

    expect(audio.removeEventListener).toHaveBeenCalledWith("loadedmetadata", listeners.loadedmetadata)
    expect(audio.removeEventListener).toHaveBeenCalledWith("timeupdate", listeners.timeupdate)
    expect(audio.removeEventListener).toHaveBeenCalledWith("play", listeners.play)
    expect(audio.removeEventListener).toHaveBeenCalledWith("pause", listeners.pause)
    expect(audio.removeEventListener).toHaveBeenCalledWith("ended", listeners.ended)
    expect(audio.removeEventListener).toHaveBeenCalledWith("waiting", listeners.waiting)
    expect(audio.removeEventListener).toHaveBeenCalledWith("canplay", listeners.canplay)
    expect(audio.removeEventListener).toHaveBeenCalledWith("error", listeners.error)
  })
})
