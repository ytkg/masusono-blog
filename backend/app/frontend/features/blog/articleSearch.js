export function normalizeArticleSearchText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

export function articleMatchesQuery(article, normalizedQuery) {
  if (!normalizedQuery) return true

  if (normalizedQuery.startsWith("#")) {
    const tagQuery = normalizedQuery.slice(1).trim()

    if (!tagQuery) return false

    return normalizeArticleSearchText(article?.tags).includes(tagQuery)
  }

  const searchTarget = [article?.title, article?.content, article?.author, article?.tags]
    .map(normalizeArticleSearchText)
    .join(" ")

  return searchTarget.includes(normalizedQuery)
}
