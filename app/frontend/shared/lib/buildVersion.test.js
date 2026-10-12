import { describe, expect, it } from "vitest"
import { BUILD_VERSION } from "./buildVersion"

describe("BUILD_VERSION", () => {
  it("ビルド識別子を常に非空文字列として公開する", () => {
    expect(typeof BUILD_VERSION).toBe("string")
    expect(BUILD_VERSION.length).toBeGreaterThan(0)
  })
})
