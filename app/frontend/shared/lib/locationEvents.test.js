import { afterEach, describe, expect, it, vi } from "vitest"
import { LOCATION_CHANGE_EVENT, currentLocationPath, notifyLocationChange } from "./locationEvents"

describe("locationEvents", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.history.replaceState({}, "", "/")
  })

  it("パス・クエリ・ハッシュを現在地として返す", () => {
    window.history.replaceState({}, "", "/search?q=Ruby#results")

    expect(currentLocationPath()).toBe("/search?q=Ruby#results")
  })

  it("場所変更イベントを通知する", () => {
    const listener = vi.fn()
    window.addEventListener(LOCATION_CHANGE_EVENT, listener)

    notifyLocationChange()

    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener(LOCATION_CHANGE_EVENT, listener)
  })

  it("SSRではwindowに触れず既定パスを返し通知を省略する", () => {
    vi.stubGlobal("window", undefined)
    expect(currentLocationPath()).toBe("/")
    expect(() => notifyLocationChange()).not.toThrow()
  })
})
