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

it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { button: 2 }])(
  "別タブ等の操作でホームintentを書かない: %j",
  (options) => {
    window.sessionStorage.clear()
    requestHomeFeed(new MouseEvent("click", { button: 0, ...options }))
    expect(consumeHomeFeedIntent()).toBe(false)
  },
)
it("処理済みclickでは既存intentを変更せず、通常clickはintentを作る", () => {
  window.sessionStorage.clear()
  const cancelled = new MouseEvent("click", { cancelable: true })
  cancelled.preventDefault()
  requestHomeFeed(cancelled)
  expect(consumeHomeFeedIntent()).toBe(false)
  requestHomeFeed(new MouseEvent("click", { button: 0 }))
  requestHomeFeed(new MouseEvent("click", { metaKey: true }))
  expect(consumeHomeFeedIntent()).toBe(true)
})
