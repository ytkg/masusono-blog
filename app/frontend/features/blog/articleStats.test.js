import { expect, it } from "vitest"
import { formatArticleStats } from "./articleStats"

it.each([0, -1, NaN, Infinity, -Infinity, "invalid", null, undefined])(
  "文字数%jは統計表示を作らない",
  (characterCount) => {
    expect(formatArticleStats({ characterCount, readingTimeMinutes: 1 })).toBeUndefined()
  },
)

it.each([0, -1, NaN, Infinity, "invalid", null, undefined])(
  "読了時間%jは表示せず、有効な文字数を保持する",
  (readingTimeMinutes) => {
    expect(formatArticleStats({ characterCount: 1234, readingTimeMinutes })).toBe("1,234字")
  },
)

it("数値文字列も正規化して文字数と0.5分刻みの読了時間を表示する", () => {
  expect(formatArticleStats({ characterCount: "1234", readingTimeMinutes: "0.5" })).toBe("1,234字・約0.5分")
})
