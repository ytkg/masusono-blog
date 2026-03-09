import { afterEach, describe, expect, it, vi } from "vitest"
import { getNow } from "./time"

describe("getNow", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("performance.now を優先する", () => {
    vi.spyOn(performance, "now").mockReturnValue(123.45)

    expect(getNow()).toBe(123.45)
  })

  it("performance がなければ Date.now にフォールバックする", () => {
    vi.stubGlobal("performance", undefined)
    vi.spyOn(Date, "now").mockReturnValue(678)

    expect(getNow()).toBe(678)
  })
})
