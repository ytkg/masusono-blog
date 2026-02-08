import { describe, expect, it } from "vitest"
import { getMiniPlayerVisibility, shouldShowMiniPlayer } from "./miniPlayerVisibility"

describe("shouldShowMiniPlayer", () => {
  it("再生対象エピソードがない場合は非表示にする", () => {
    expect(shouldShowMiniPlayer({ pathname: "/podcast", currentEpisodeId: null, visibleEpisodeId: null })).toBe(false)
  })

  it("ポッドキャスト以外のルートでは表示する", () => {
    expect(
      shouldShowMiniPlayer({
        pathname: "/blog",
        currentEpisodeId: "001",
        visibleEpisodeId: "001",
      }),
    ).toBe(true)
  })

  it("ポッドキャストルートで再生中エピソードが画面内なら非表示にする", () => {
    expect(
      shouldShowMiniPlayer({
        pathname: "/podcast",
        currentEpisodeId: "001",
        visibleEpisodeId: "001",
      }),
    ).toBe(false)
  })

  it("ポッドキャストルートで再生中エピソードが画面外なら表示する", () => {
    expect(
      shouldShowMiniPlayer({
        pathname: "/podcast/002",
        currentEpisodeId: "001",
        visibleEpisodeId: null,
      }),
    ).toBe(true)
  })
})

describe("getMiniPlayerVisibility", () => {
  it("再生対象エピソードがない場合は理由 NO_CURRENT_EPISODE を返す", () => {
    expect(getMiniPlayerVisibility({ pathname: "/podcast", currentEpisodeId: null, visibleEpisodeId: null })).toEqual({
      isVisible: false,
      reason: "NO_CURRENT_EPISODE",
    })
  })

  it("ポッドキャスト以外のルートは理由 NON_PODCAST_ROUTE で表示する", () => {
    expect(
      getMiniPlayerVisibility({
        pathname: "/blog",
        currentEpisodeId: "001",
        visibleEpisodeId: "001",
      }),
    ).toEqual({
      isVisible: true,
      reason: "NON_PODCAST_ROUTE",
    })
  })

  it("ポッドキャスト配下で再生中エピソードが可視なら理由 CURRENT_EPISODE_VISIBLE を返す", () => {
    expect(
      getMiniPlayerVisibility({
        pathname: "/podcast",
        currentEpisodeId: "001",
        visibleEpisodeId: "001",
      }),
    ).toEqual({
      isVisible: false,
      reason: "CURRENT_EPISODE_VISIBLE",
    })
  })

  it("ポッドキャスト配下で再生中エピソードが非可視なら理由 CURRENT_EPISODE_NOT_VISIBLE で表示する", () => {
    expect(
      getMiniPlayerVisibility({
        pathname: "/podcast/002",
        currentEpisodeId: "001",
        visibleEpisodeId: null,
      }),
    ).toEqual({
      isVisible: true,
      reason: "CURRENT_EPISODE_NOT_VISIBLE",
    })
  })
})
