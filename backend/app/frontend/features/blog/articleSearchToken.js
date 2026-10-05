import { parseArticleTags } from "./parseArticleTags"
import { normalizeArticleSearchText } from "./articleSearchText"

function articleTags(article) {
  return parseArticleTags(article?.tags).map(normalizeArticleSearchText).filter(Boolean)
}

function matchesReadingTime(article, query) {
  const readingTimeQuery = query.trim()
  const readingTimeMinutes = Number(article?.readingTimeMinutes)

  if (!readingTimeQuery || !Number.isFinite(readingTimeMinutes)) return false

  if (readingTimeQuery.endsWith("+")) {
    const minReadingTime = Number(readingTimeQuery.slice(0, -1))
    return Number.isFinite(minReadingTime) && readingTimeMinutes >= minReadingTime
  }

  if (readingTimeQuery.includes("-")) {
    const [minReadingTime, maxReadingTime] = readingTimeQuery.split("-").map(Number)
    return (
      Number.isFinite(minReadingTime) &&
      Number.isFinite(maxReadingTime) &&
      readingTimeMinutes > minReadingTime &&
      readingTimeMinutes <= maxReadingTime
    )
  }

  const maxReadingTime = Number(readingTimeQuery)
  return Number.isFinite(maxReadingTime) && readingTimeMinutes <= maxReadingTime
}

export function articleMatchesToken(article, token, getSearchTarget) {
  if (token.startsWith("read:")) {
    return matchesReadingTime(article, token.slice(5))
  }

  if (token.startsWith("#")) {
    const tagQuery = token.slice(1).trim()

    if (!tagQuery) return false

    return articleTags(article).includes(tagQuery)
  }

  if (token.startsWith("@")) {
    const authorQuery = token.slice(1).trim()

    if (!authorQuery) return false

    return normalizeArticleSearchText(article?.author).includes(authorQuery)
  }

  return getSearchTarget().includes(token)
}
