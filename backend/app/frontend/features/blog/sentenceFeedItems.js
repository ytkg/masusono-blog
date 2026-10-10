export const SENTENCE_REVEAL_MAX_DELAY_MS = 620

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
