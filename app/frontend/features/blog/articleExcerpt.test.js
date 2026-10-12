import { expect, it } from "vitest"
import { buildArticleExcerpt } from "./articleExcerpt"
import { firstSentenceFromHtml } from "./sentenceArticleData"

it("does not split an emoji at the preview boundary", () => {
  const text = "あ".repeat(79) + "😊続き"
  expect(buildArticleExcerpt(text, true)).toEqual({ excerpt: "あ".repeat(79) + "…", canExpand: true })
  expect(firstSentenceFromHtml(text)).toBe("あ".repeat(79))
})
it("keeps an emoji which fits within the preview", () => {
  const text = "あ".repeat(78) + "😊"
  expect(buildArticleExcerpt(text, true)).toEqual({ excerpt: text, canExpand: false })
  expect(firstSentenceFromHtml(text)).toBe(text)
})
