import { describe, expect, it } from "vitest"
import { getMiniPlayerVisibility, shouldShowMiniPlayer } from "./miniPlayerVisibility"

describe("miniPlayerVisibility", () => {
  it("currentEpisodeId がないと非表示になる", () => {
    expect(getMiniPlayerVisibility({ currentEpisodeId: null })).toEqual({
      isVisible: false,
      reason: "NO_CURRENT_EPISODE",
    })
    expect(shouldShowMiniPlayer({ currentEpisodeId: null })).toBe(false)
  })

  it("currentEpisodeId があれば表示になる", () => {
    expect(getMiniPlayerVisibility({ currentEpisodeId: "ep-1" })).toEqual({
      isVisible: true,
      reason: "HAS_CURRENT_EPISODE",
    })
    expect(shouldShowMiniPlayer({ currentEpisodeId: "ep-1" })).toBe(true)
  })
})
