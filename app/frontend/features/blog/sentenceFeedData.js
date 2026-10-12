import { makeSentenceItems, shuffleArticles, SENTENCE_REVEAL_MAX_DELAY_MS } from "./sentenceFeedItems"

export { firstSentenceFromHtml, prepareSentenceArticles } from "./sentenceArticleData"
export { makeSentenceItems, shuffleArticles, SENTENCE_REVEAL_MAX_DELAY_MS } from "./sentenceFeedItems"

export const INITIAL_SENTENCE_COUNT = 80
export const APPEND_SENTENCE_COUNT = 24
export const SENTENCE_REVEAL_DURATION_MS = 800
const SENTENCE_REVEAL_BUFFER_MS = 80
export const SENTENCE_REVEAL_SETTLE_MS =
  SENTENCE_REVEAL_DURATION_MS + SENTENCE_REVEAL_MAX_DELAY_MS + SENTENCE_REVEAL_BUFFER_MS
export const SENTENCE_STATE_VERSION = 1

function serializeSentenceItems(items) {
  return items.map(({ article, key, revealDelay, sentence }) => ({
    articleId: article.id,
    hasRevealed: false,
    key,
    revealDelay,
    sentence,
  }))
}

export function createInitialSentenceState(articles, hasMore = false) {
  const source = shuffleArticles(articles.filter((article) => article.id && article.sentence))

  if (source.length === 0) {
    return { items: [], nextCursor: 0, sourceIds: [], version: SENTENCE_STATE_VERSION }
  }

  const initial = makeSentenceItems(
    source,
    hasMore ? Math.min(INITIAL_SENTENCE_COUNT, source.length) : INITIAL_SENTENCE_COUNT,
    0,
  )

  return {
    items: serializeSentenceItems(initial.items),
    nextCursor: initial.nextCursor,
    sourceIds: initial.pool.map((article) => article.id),
    version: SENTENCE_STATE_VERSION,
  }
}

export function appendSentenceItems(state, source, hasMore = false) {
  const count = hasMore
    ? Math.min(APPEND_SENTENCE_COUNT, Math.max(0, source.length - state.nextCursor))
    : APPEND_SENTENCE_COUNT
  const next = makeSentenceItems(source, count, state.nextCursor)

  return {
    state: {
      ...state,
      items: [...state.items, ...serializeSentenceItems(next.items)],
      nextCursor: next.nextCursor,
      sourceIds: next.pool.map((article) => article.id),
      version: SENTENCE_STATE_VERSION,
    },
    source: next.pool,
  }
}

export function markSentenceItemsRevealed(state) {
  return {
    ...state,
    items: state.items.map((item) => ({ ...item, hasRevealed: true })),
    version: SENTENCE_STATE_VERSION,
  }
}

export function mergeSentenceArticleSources(state, articles, hasMore = false) {
  const knownIds = new Set(state.sourceIds)
  const newIds = articles.flatMap((article) => (knownIds.has(article.id) ? [] : [article.id]))
  if (newIds.length === 0) return state
  if (state.items.length === 0) return createInitialSentenceState(articles, hasMore)
  return { ...state, sourceIds: [...state.sourceIds, ...newIds] }
}
