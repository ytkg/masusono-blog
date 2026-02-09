import { describe, expect, it } from "vitest"
import { getMiniPlayerVisibility, shouldShowMiniPlayer } from "./miniPlayerVisibility"

describe("shouldShowMiniPlayer", () => {
  it("再生対象エピソードがない場合は非表示にする", () => {
    expect(shouldShowMiniPlayer({ currentEpisodeId: null })).toBe(false)
  })

  it("再生対象エピソードがある場合は表示する", () => {
    expect(shouldShowMiniPlayer({ currentEpisodeId: "001" })).toBe(true)
  })
})

describe("getMiniPlayerVisibility", () => {
  it("再生対象エピソードがない場合は理由 NO_CURRENT_EPISODE を返す", () => {
    expect(getMiniPlayerVisibility({ currentEpisodeId: null })).toEqual({
      isVisible: false,
      reason: "NO_CURRENT_EPISODE",
    })
  })

  it("再生対象エピソードがある場合は理由 HAS_CURRENT_EPISODE で表示する", () => {
    expect(getMiniPlayerVisibility({ currentEpisodeId: "001" })).toEqual({
      isVisible: true,
      reason: "HAS_CURRENT_EPISODE",
    })
  })
})
