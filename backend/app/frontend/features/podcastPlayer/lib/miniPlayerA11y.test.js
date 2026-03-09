import { describe, expect, it } from "vitest"
import {
  EMBEDDED_PLAYER_ARIA_LABELS,
  MINI_PLAYER_ARIA_LABELS,
  getEmbeddedPlayerSeekSliderAriaLabel,
  getMiniPlayerSeekSliderAriaLabel,
} from "./miniPlayerA11y"

describe("miniPlayerA11y", () => {
  it("主要な aria-label 定数を持つ", () => {
    expect(MINI_PLAYER_ARIA_LABELS.play).toBe("ミニプレイヤーで再生")
    expect(MINI_PLAYER_ARIA_LABELS.pause).toBe("ミニプレイヤーを一時停止")
    expect(EMBEDDED_PLAYER_ARIA_LABELS.play).toBe("再生")
    expect(EMBEDDED_PLAYER_ARIA_LABELS.pause).toBe("一時停止")
  })

  it("スライダー用の aria-label を組み立てる", () => {
    expect(getMiniPlayerSeekSliderAriaLabel("第1回")).toBe("ミニプレイヤーの再生位置: 第1回")
    expect(getEmbeddedPlayerSeekSliderAriaLabel("第1回")).toBe("エピソード再生位置: 第1回")
  })
})
