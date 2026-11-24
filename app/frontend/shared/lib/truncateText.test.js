import { describe, expect, it } from "vitest"
import { truncateText } from "./truncateText"

describe("truncateText", () => {
  it.each([
    ["", 0, ""],
    ["短い文", 10, "短い文"],
    ["あいう", 3, "あいう"],
    ["あいう", 2, "あい"],
    ["abc", 0, ""],
    ["a😀b", 2, "a"],
    ["a😀b", 3, "a😀"],
    ["aか\u3099b", 2, "a"],
    ["aか\u3099b", 3, "aか\u3099"],
    ["a👍🏽b", 4, "a"],
    ["a👍🏽b", 5, "a👍🏽"],
    ["a🇯🇵b", 4, "a"],
    ["a🇯🇵b", 5, "a🇯🇵"],
    ["a👨‍👩‍👧‍👦b", 11, "a"],
    ["a👨‍👩‍👧‍👦b", 12, "a👨‍👩‍👧‍👦"],
  ])("%jをUTF-16上限%iで切り詰めても文字を分断しない", (text, limit, expected) => {
    expect(truncateText(text, limit)).toBe(expected)
  })
})
