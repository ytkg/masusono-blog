import { describe, expect, it } from "vitest"
import { articleMatchesToken } from "./articleSearchToken"

describe("reading time syntax", () => {
  it.each(["", "+", "-", "1-", "-2", "1-2-3", "1e2", "Infinity", "0x10"])("rejects %s", (query) => {
    expect(articleMatchesToken({ readingTimeMinutes: 1.5 }, `read:${query}`, () => "")).toBe(false)
  })
  it.each([
    ["2", true],
    ["1", false],
    ["1+", true],
    ["1-1.5", true],
    ["1.5-2", false],
  ])("matches %s", (query, expected) => {
    expect(articleMatchesToken({ readingTimeMinutes: 1.5 }, `read:${query}`, () => "")).toBe(expected)
  })
})
