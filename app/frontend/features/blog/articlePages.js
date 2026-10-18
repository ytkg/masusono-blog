import { appendUniqueById } from "@/shared/lib/appendUniqueById"
import { requestJson } from "@/shared/lib/fetchJson"

export async function fetchArticlePage(offset, { signal }) {
  const result = await requestJson(`/api/app/articles?offset=${offset}`, { signal })
  const nextOffset = result.pagination?.nextOffset
  if (
    !Array.isArray(result.articles) ||
    (nextOffset !== null && (!Number.isInteger(nextOffset) || nextOffset <= offset))
  ) {
    throw new Error("Invalid articles page")
  }
  return { articles: result.articles, nextOffset }
}

export function appendArticlePage(state, page) {
  // A newly appended list should not restore an earlier navigation's scroll position.
  return { articles: appendUniqueById(state.articles, page.articles), nextOffset: page.nextOffset }
}
