import { extractHtmlText } from "./articleHtmlText"

export const INITIAL_SENTENCE_COUNT = 80
export const APPEND_SENTENCE_COUNT = 24
export const SENTENCE_REVEAL_DURATION_MS = 800
export const SENTENCE_REVEAL_MAX_DELAY_MS = 620
export const SENTENCE_REVEAL_SETTLE_MS = SENTENCE_REVEAL_DURATION_MS + SENTENCE_REVEAL_MAX_DELAY_MS + 80
export const SENTENCE_STATE_VERSION = 1

const SENTENCE_END_PATTERN = /[。！？!?]+[」』）)］\]｝}”’】〕〉》〙〗〟'"]*|\n/g

export function firstSentenceFromHtml(html = "") {
  const text = extractHtmlText(html)
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim()
  const match = firstSentenceBoundary(text)

  return match ? text.slice(0, match.index + match[0].length).trim() : text.slice(0, 80)
}

function firstSentenceBoundary(text) {
  for (const candidate of text.matchAll(SENTENCE_END_PATTERN)) {
    const end = candidate[0]
    const nextCharacter = text[candidate.index + end.length] || ""
    const hasClosingMark = /[」』）)］\]｝}”’】〕〉》〙〗〟'"]$/.test(end)

    if (end === "\n" || !hasClosingMark || !/^[ぁ-んァ-ヶー一-龠々〆ヵヶA-Za-z0-9]/.test(nextCharacter)) {
      return candidate
    }
  }
}

export function shuffleArticles(articles) {
  const result = [...articles]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = result[index]
    result[index] = result[randomIndex]
    result[randomIndex] = current
  }

  return result
}

export function prepareSentenceArticles(articles) {
  return articles
    .map((article) => ({ ...article, sentence: firstSentenceFromHtml(article.content) }))
    .filter((article) => article.id && article.sentence)
}

export function makeSentenceItems(source, count, cursor) {
  const items = []
  let nextCursor = cursor
  let pool = source

  for (let index = 0; index < count; index += 1) {
    if (nextCursor > 0 && nextCursor % pool.length === 0) pool = shuffleArticles(pool)

    const article = pool[nextCursor % pool.length]
    items.push({
      article,
      key: `${nextCursor}-${article.id}`,
      sentence: article.sentence,
      revealDelay: Math.floor(Math.random() * SENTENCE_REVEAL_MAX_DELAY_MS),
    })
    nextCursor += 1
  }

  return { items, nextCursor, pool }
}

function serializeSentenceItems(items) {
  return items.map(({ article, key, revealDelay, sentence }) => ({
    articleId: article.id,
    hasRevealed: false,
    key,
    revealDelay,
    sentence,
  }))
}

export function createInitialSentenceState(articles) {
  const source = shuffleArticles(articles.filter((article) => article.id && article.sentence))

  if (source.length === 0) {
    return { items: [], nextCursor: 0, sourceIds: [], version: SENTENCE_STATE_VERSION }
  }

  const initial = makeSentenceItems(source, INITIAL_SENTENCE_COUNT, 0)

  return {
    items: serializeSentenceItems(initial.items),
    nextCursor: initial.nextCursor,
    sourceIds: initial.pool.map((article) => article.id),
    version: SENTENCE_STATE_VERSION,
  }
}

export function appendSentenceItems(state, source) {
  const next = makeSentenceItems(source, APPEND_SENTENCE_COUNT, state.nextCursor)

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
