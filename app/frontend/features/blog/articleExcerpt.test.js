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

it.each(["👨‍👩‍👧‍👦", "🇯🇵", "á"])("does not split a joined character %s", (joined) => {
  const prefix = "あ".repeat(79)
  const text = prefix + joined + "後"
  expect(buildArticleExcerpt(text, true).excerpt).toBe(prefix + "…")
  expect(firstSentenceFromHtml(text)).toBe(prefix)
})

it("別sectionの書き出しを1文として連結しない", () => {
  expect(firstSentenceFromHtml("<section>最初</section><section>次</section>")).toBe("最初")
})
