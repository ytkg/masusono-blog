import { expect, it } from "vitest"
import { createInitialSentenceState, mergeSentenceArticleSources } from "./sentenceFeedData"

it("keeps displayed cards and their order when new articles arrive", () => {
  const state = {
    sourceIds: ["a"],
    items: [{ articleId: "a", key: "0-a", hasRevealed: true }],
    nextCursor: 1,
    version: 1,
  }
  const next = mergeSentenceArticleSources(state, [
    { id: "a", sentence: "既存。" },
    { id: "b", sentence: "追加。" },
  ])
  expect(next.sourceIds).toEqual(["a", "b"])
  expect(next.items).toBe(state.items)
  expect(next.nextCursor).toBe(1)
  expect(state.sourceIds).toEqual(["a"])
})

it("preserves remembered state when no new article arrives", () => {
  const state = createInitialSentenceState([{ id: "a", sentence: "既存。" }])
  expect(mergeSentenceArticleSources(state, [{ id: "a", sentence: "既存。" }])).toBe(state)
})

it("initializes an empty feed when its first usable article arrives", () => {
  const state = createInitialSentenceState([])
  const next = mergeSentenceArticleSources(state, [{ id: "a", sentence: "追加。" }])
  expect(next.sourceIds).toEqual(["a"])
  expect(next.items).toHaveLength(80)
  expect(next.items.every((item) => item.articleId === "a")).toBe(true)
})
