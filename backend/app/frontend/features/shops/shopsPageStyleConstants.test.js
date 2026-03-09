import { describe, expect, it } from "vitest"
import { SHOPS_PAGE_LAYOUT } from "./shopsPageStyleConstants"

describe("SHOPS_PAGE_LAYOUT", () => {
  it("shop page 用の主要レイアウト値を公開する", () => {
    expect(SHOPS_PAGE_LAYOUT.viewportHeightOffset).toBe(112)
    expect(SHOPS_PAGE_LAYOUT.mapHeight).toEqual({ xs: 186, sm: 240 })
    expect(SHOPS_PAGE_LAYOUT.cardMetaGap).toBe(1)
  })
})
