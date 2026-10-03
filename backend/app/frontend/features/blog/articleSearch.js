import { parseArticleTags } from "./parseArticleTags"
import { extractTextFromHtml } from "./articleHtmlText"

export function normalizeArticleSearchText(value) {
  return extractTextFromHtml(value).toLowerCase()
}

function parseSearchQuery(normalizedQuery) {
  return normalizedQuery
    .split(/\s+or\s+/i)
    .map((group) => group.split(/\s+/).filter((token) => token && token !== "and"))
    .filter((group) => group.length)
}

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

function articleMatchesToken(article, token, getSearchTarget) {
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

export function articleMatchesQuery(article, normalizedQuery) {
  if (!normalizedQuery) return true

  const queryGroups = parseSearchQuery(normalizedQuery)

  if (!queryGroups.length) return false

  // Parse the body only for plain-text tokens, at most once per article/query.
  let searchTarget
  const getSearchTarget = () => {
    searchTarget ??= [article?.title, article?.content, article?.author, article?.tags]
      .map(normalizeArticleSearchText)
      .join(" ")
    return searchTarget
  }

  return queryGroups.some((group) => group.every((token) => articleMatchesToken(article, token, getSearchTarget)))
}
