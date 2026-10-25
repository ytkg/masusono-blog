import { normalizeArticleSearchText } from "./articleSearchText"
import { articleMatchesToken } from "./articleSearchToken"
import { extractHtmlText } from "./articleHtmlText"

export { normalizeArticleSearchText } from "./articleSearchText"

function parseSearchQuery(normalizedQuery) {
  const tokens = normalizedQuery.match(/(?:[^\s"]+|"(?:\\.|[^"\\])*")+/g) ?? []
  const groups = [[]]
  tokens.forEach((token, index) => {
    if (token === "or" && index > 0 && index < tokens.length - 1) groups.push([])
    else if (token !== "and") {
      groups.at(-1).push(token.replace(/"((?:\\.|[^"\\])*)"/g, (_quoted, text) => text.replace(/\\(["\\])/g, "$1")))
    }
  })
  return groups.filter((group) => group.length > 0)
}

export function prepareArticleQuery(normalizedQuery) {
  if (!normalizedQuery) return () => true

  const queryGroups = parseSearchQuery(normalizedQuery)

  if (queryGroups.length === 0) return () => false

  return (article) => {
    // Parse the body only for plain-text tokens, at most once per article/query.
    let searchTarget
    const getSearchTarget = () => {
      searchTarget ??= [article?.title, extractHtmlText(article?.content), article?.author, article?.tags]
        .map(normalizeArticleSearchText)
        .join(" ")
      return searchTarget
    }

    return queryGroups.some((group) => group.every((token) => articleMatchesToken(article, token, getSearchTarget)))
  }
}
