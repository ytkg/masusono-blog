import { afterEach, describe, expect, it } from "vitest"
import { consumeHomeFeedIntent, requestHomeFeed } from "./homeNavigation"

describe("home navigation intent", () => {
  afterEach(() => {
    window.sessionStorage.clear()
  })

  it("ホームを明示的に開く合図は一度だけ読み取れる", () => {
    requestHomeFeed()

    expect(consumeHomeFeedIntent()).toBe(true)
    expect(consumeHomeFeedIntent()).toBe(false)
  })
})
