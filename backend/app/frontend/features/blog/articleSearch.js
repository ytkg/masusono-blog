export function normalizeArticleSearchText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

export function articleMatchesQuery(article, normalizedQuery) {
  if (!normalizedQuery) return true

  const searchTarget = [article?.title, article?.content, article?.author].map(normalizeArticleSearchText).join(" ")

  return searchTarget.includes(normalizedQuery)
}
