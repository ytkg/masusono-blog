import { expect, it } from "vitest"
import { makeSentenceItems } from "./sentenceFeedItems"
import { appendSentenceItems } from "./sentenceFeedData"

it("keeps the cursor and feed when its source becomes empty", () => {
  const source = []
  expect(makeSentenceItems(source, 24, 80)).toEqual({ items: [], nextCursor: 80, pool: source })
  const state = { items: [{ articleId: "a" }], nextCursor: 80, sourceIds: ["a"], version: 1 }
  const next = appendSentenceItems(state, source)
  expect(next.state.items).toEqual(state.items)
  expect(next.state.nextCursor).toBe(80)
  expect(state.sourceIds).toEqual(["a"])
})
