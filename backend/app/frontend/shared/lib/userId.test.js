import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ensureUserIdCookie, getUserIdFromCookie } from "./userId"

function clearUserIdCookie() {
  document.cookie = "user_id=; Max-Age=0; Path=/"
}

describe("userId", () => {
  beforeEach(() => {
    clearUserIdCookie()
  })

  afterEach(() => {
    clearUserIdCookie()
    vi.unstubAllGlobals()
  })

  it("cookie から user_id を取得する", () => {
    document.cookie = "user_id=%E5%A2%97%E7%94%B0%20123; Path=/"

    expect(getUserIdFromCookie()).toBe("増田 123")
  })

  it("既存の cookie があれば再利用する", () => {
    document.cookie = "user_id=existing-id; Path=/"
    const randomUUID = vi.fn()
    vi.stubGlobal("crypto", { randomUUID })

    expect(ensureUserIdCookie()).toBe("existing-id")
    expect(randomUUID).not.toHaveBeenCalled()
    expect(getUserIdFromCookie()).toBe("existing-id")
  })

  it("cookie がなければ UUID を生成して保存する", () => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn().mockReturnValue("generated-id") })

    expect(ensureUserIdCookie()).toBe("generated-id")
    expect(getUserIdFromCookie()).toBe("generated-id")
  })
})
