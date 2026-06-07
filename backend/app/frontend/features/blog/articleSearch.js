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
  if (token.startsWith("#")) {
    const tagQuery = token.slice(1).trim()

    if (!tagQuery) return false

    return normalizeArticleSearchText(article?.tags).includes(tagQuery)
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
