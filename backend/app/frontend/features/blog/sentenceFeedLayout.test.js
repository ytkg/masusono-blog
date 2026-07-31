import { describe, expect, it } from "vitest"
import { sentenceFeedLayout } from "./sentenceFeedLayout"

describe("sentenceFeedLayout", () => {
  it("高さが最も低い列から順にカードを配置する", () => {
    const layout = sentenceFeedLayout({
      containerWidth: 200,
      itemHeights: [100, 60, 80, 40],
      viewportWidth: 1000,
    })

    expect(layout.items).toEqual([
      { left: 0, top: 0, width: 91 },
      { left: 109, top: 0, width: 91 },
      { left: 109, top: 78, width: 91 },
      { left: 0, top: 118, width: 91 },
    ])
    expect(layout.height).toBe(158)
  })

  it("狭い画面では列幅と余白を小さくする", () => {
    const layout = sentenceFeedLayout({ containerWidth: 130, itemHeights: [20, 20], viewportWidth: 720 })

    expect(layout.items).toEqual([
      { left: 0, top: 0, width: 59 },
      { left: 71, top: 0, width: 59 },
    ])
    expect(layout.height).toBe(20)
  })
})
