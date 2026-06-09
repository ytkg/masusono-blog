export function normalizeArticleSearchText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function parseSearchQuery(normalizedQuery) {
  return normalizedQuery
    .split(/\s+or\s+/i)
    .map((group) => group.split(/\s+/).filter((token) => token && token !== "and"))
    .filter((group) => group.length)
}

function articleMatchesToken(article, token) {
  if (token.startsWith("read:")) {
    const readingTimeQuery = token.slice(5).trim()
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

  if (token.startsWith("#")) {
    const tagQuery = token.slice(1).trim()

    if (!tagQuery) return false

    return normalizeArticleSearchText(article?.tags).includes(tagQuery)
  }

  if (token.startsWith("@")) {
    const authorQuery = token.slice(1).trim()

    if (!authorQuery) return false

    return normalizeArticleSearchText(article?.author).includes(authorQuery)
  }

  const searchTarget = [article?.title, article?.content, article?.author, article?.tags]
    .map(normalizeArticleSearchText)
    .join(" ")

  return searchTarget.includes(token)
}

export function articleMatchesQuery(article, normalizedQuery) {
  if (!normalizedQuery) return true

  const queryGroups = parseSearchQuery(normalizedQuery)

  if (!queryGroups.length) return false

  return queryGroups.some((group) => group.every((token) => articleMatchesToken(article, token)))
}
