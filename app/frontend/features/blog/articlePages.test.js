import { beforeEach, describe, expect, it, vi } from "vitest"
import { requestJson } from "@/shared/lib/fetchJson"
import { appendArticlePage, fetchArticlePage } from "./articlePages"

vi.mock("@/shared/lib/fetchJson", () => ({ requestJson: vi.fn() }))
beforeEach(() => vi.clearAllMocks())

describe("fetchArticlePage", () => {
  it.each([null, 20])("accepts a terminal or advancing cursor: %s", async (nextOffset) => {
    requestJson.mockResolvedValue({ articles: [{ id: "a" }], pagination: { nextOffset } })
    await expect(fetchArticlePage(10, { signal: new AbortController().signal })).resolves.toEqual({
      articles: [{ id: "a" }],
      nextOffset,
    })
  })

  it.each([undefined, -1, 10, 9, 10.5, "20"])("rejects a missing or invalid cursor: %s", async (nextOffset) => {
    requestJson.mockResolvedValue({ articles: [], pagination: { nextOffset } })
    await expect(fetchArticlePage(10, { signal: new AbortController().signal })).rejects.toThrow(
      "Invalid articles page",
    )
  })

  it("rejects an invalid article collection", async () => {
    requestJson.mockResolvedValue({ articles: {}, pagination: { nextOffset: null } })
    await expect(fetchArticlePage(10, { signal: new AbortController().signal })).rejects.toThrow(
      "Invalid articles page",
    )
  })
})

it("appends unique articles without mutating remembered state or restoring stale scroll", () => {
  const state = { articles: [{ id: "a", title: "original" }], nextOffset: 10, scrollY: 500 }
  const page = { articles: [{ id: "a", title: "duplicate" }, { id: "b" }, { id: "b" }], nextOffset: null }
  expect(appendArticlePage(state, page)).toEqual({
    articles: [{ id: "a", title: "original" }, { id: "b" }],
    nextOffset: null,
  })
  expect(state).toEqual({ articles: [{ id: "a", title: "original" }], nextOffset: 10, scrollY: 500 })
})
