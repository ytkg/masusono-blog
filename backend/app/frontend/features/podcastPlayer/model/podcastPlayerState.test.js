import { describe, expect, it } from "vitest"
import { initialPodcastPlayerState, podcastPlayerReducer } from "./podcastPlayerState"

describe("podcastPlayerReducer", () => {
  it("初期 state を公開する", () => {
    expect(initialPodcastPlayerState).toEqual({
      status: "idle",
      error: null,
      isPlaying: false,
    })
  })

  it("PLAY_REQUESTED で loading にする", () => {
    expect(podcastPlayerReducer(initialPodcastPlayerState, { type: "PLAY_REQUESTED" })).toEqual({
      status: "loading",
      error: null,
      isPlaying: false,
    })
  })

  it("PLAY_STARTED で ready かつ再生中にする", () => {
    expect(podcastPlayerReducer(initialPodcastPlayerState, { type: "PLAY_STARTED" })).toEqual({
      status: "ready",
      error: null,
      isPlaying: true,
    })
  })

  it("PLAY_PAUSED で再生を止める", () => {
    expect(podcastPlayerReducer({ status: "ready", error: null, isPlaying: true }, { type: "PLAY_PAUSED" })).toEqual({
      status: "ready",
      error: null,
      isPlaying: false,
    })
  })

  it("PLAY_ENDED で ready に戻す", () => {
    expect(podcastPlayerReducer({ status: "loading", error: null, isPlaying: true }, { type: "PLAY_ENDED" })).toEqual({
      status: "ready",
      error: null,
      isPlaying: false,
    })
  })

  it("BUFFERING_STARTED で loading にする", () => {
    expect(
      podcastPlayerReducer({ status: "ready", error: null, isPlaying: true }, { type: "BUFFERING_STARTED" }),
    ).toEqual({
      status: "loading",
      error: null,
      isPlaying: true,
    })
  })

  it("CAN_PLAY で ready にしつつ error を消す", () => {
    expect(podcastPlayerReducer({ status: "loading", error: "x", isPlaying: false }, { type: "CAN_PLAY" })).toEqual({
      status: "ready",
      error: null,
      isPlaying: false,
    })
  })

  it("PLAY_FAILED と AUDIO_ERROR で error state にする", () => {
    expect(podcastPlayerReducer(initialPodcastPlayerState, { type: "PLAY_FAILED", error: "再生失敗" })).toEqual({
      status: "error",
      error: "再生失敗",
      isPlaying: false,
    })
    expect(podcastPlayerReducer(initialPodcastPlayerState, { type: "AUDIO_ERROR", error: "読込失敗" })).toEqual({
      status: "error",
      error: "読込失敗",
      isPlaying: false,
    })
  })

  it("未知の action は state をそのまま返す", () => {
    expect(podcastPlayerReducer(initialPodcastPlayerState, { type: "UNKNOWN" })).toBe(initialPodcastPlayerState)
  })
})
