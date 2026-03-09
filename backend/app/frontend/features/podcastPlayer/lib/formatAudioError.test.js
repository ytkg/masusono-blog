import { describe, expect, it } from "vitest"
import { formatAudioError } from "./formatAudioError"

function buildAudioError(code) {
  return {
    error: {
      code,
      MEDIA_ERR_ABORTED: 1,
      MEDIA_ERR_NETWORK: 2,
      MEDIA_ERR_DECODE: 3,
      MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
    },
  }
}

describe("formatAudioError", () => {
  it("error がないときは汎用メッセージを返す", () => {
    expect(formatAudioError({ error: null })).toBe("音声の読み込みに失敗しました。")
  })

  it("メディアエラーコードごとの文言を返す", () => {
    expect(formatAudioError(buildAudioError(1))).toBe("音声の読み込みが中断されました。")
    expect(formatAudioError(buildAudioError(2))).toBe("ネットワークエラーで音声を取得できませんでした。")
    expect(formatAudioError(buildAudioError(3))).toBe("音声データの再生に失敗しました。")
    expect(formatAudioError(buildAudioError(4))).toBe("この音声フォーマットは再生できません。")
  })

  it("未知のコードでは汎用メッセージにフォールバックする", () => {
    expect(formatAudioError(buildAudioError(999))).toBe("音声の読み込みに失敗しました。")
  })
})
