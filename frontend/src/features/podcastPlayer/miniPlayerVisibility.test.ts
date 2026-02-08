import { describe, expect, it } from "vitest"
import { shouldShowMiniPlayer } from "./miniPlayerVisibility"

describe("shouldShowMiniPlayer", () => {
  it("再生対象エピソードがない場合は非表示にする", () => {
    expect(shouldShowMiniPlayer({ pathname: "/podcast", currentEpisodeId: null, visibleEpisodeIds: new Set() })).toBe(
      false,
    )
  })

  it("ポッドキャスト以外のルートでは表示する", () => {
    expect(
      shouldShowMiniPlayer({
        pathname: "/blog",
        currentEpisodeId: "001",
        visibleEpisodeIds: new Set(["001"]),
      }),
    ).toBe(true)
  })

  it("ポッドキャストルートで再生中エピソードが画面内なら非表示にする", () => {
    expect(
      shouldShowMiniPlayer({
        pathname: "/podcast",
        currentEpisodeId: "001",
        visibleEpisodeIds: new Set(["001"]),
      }),
    ).toBe(false)
  })

  it("ポッドキャストルートで再生中エピソードが画面外なら表示する", () => {
    expect(
      shouldShowMiniPlayer({
        pathname: "/podcast/002",
        currentEpisodeId: "001",
        visibleEpisodeIds: new Set(["002"]),
      }),
    ).toBe(true)
  })
})
