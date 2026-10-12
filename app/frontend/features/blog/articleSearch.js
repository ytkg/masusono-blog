import { normalizeArticleSearchText } from "./articleSearchText"
import { articleMatchesToken } from "./articleSearchToken"

export { normalizeArticleSearchText } from "./articleSearchText"

const OR_SEPARATOR_PATTERN = /\s+or\s+/i
const TOKEN_SEPARATOR_PATTERN = /\s+/

function parseSearchQuery(normalizedQuery) {
  return normalizedQuery
    .split(OR_SEPARATOR_PATTERN)
    .map((group) => group.split(TOKEN_SEPARATOR_PATTERN).filter((token) => token && token !== "and"))
    .filter((group) => group.length > 0)
}

export function prepareArticleQuery(normalizedQuery) {
  if (!normalizedQuery) return () => true

  const queryGroups = parseSearchQuery(normalizedQuery)

  if (queryGroups.length === 0) return () => false

  return (article) => {
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
}

export function articleMatchesQuery(article, normalizedQuery) {
  return prepareArticleQuery(normalizedQuery)(article)
}
