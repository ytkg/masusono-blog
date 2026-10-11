import { expect, it } from "vitest"
import { formatArticleStats } from "./articleStats"

it.each([0, -1, NaN, Infinity, undefined, "invalid"])("hides unavailable character counts: %s", (characterCount) => {
  expect(formatArticleStats({ characterCount, readingTimeMinutes: 1 })).toBeUndefined()
})
it("formats numeric strings and omits an invalid reading time", () => {
  expect(formatArticleStats({ characterCount: "1234", readingTimeMinutes: "1.5" })).toBe("1,234字・約1.5分")
  expect(formatArticleStats({ characterCount: 1234, readingTimeMinutes: Infinity })).toBe("1,234字")
})
