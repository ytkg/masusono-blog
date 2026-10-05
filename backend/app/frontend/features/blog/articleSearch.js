import { normalizeArticleSearchText } from "./articleSearchText"
import { articleMatchesToken } from "./articleSearchToken"

export { normalizeArticleSearchText } from "./articleSearchText"

function parseSearchQuery(normalizedQuery) {
  return normalizedQuery
    .split(/\s+or\s+/i)
    .map((group) => group.split(/\s+/).filter((token) => token && token !== "and"))
    .filter((group) => group.length)
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
