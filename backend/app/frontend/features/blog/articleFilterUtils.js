export const DEFAULT_AUTHOR = "all"
const PRIORITY_AUTHOR_NAME = "増田"

function normalizeAuthor(author) {
  return typeof author === "string" ? author.trim() : ""
}

export function getArticleAuthorOptions(articles) {
  const counts = new Map()

  ;(articles ?? []).forEach((article) => {
    const name = normalizeAuthor(article?.author)

    if (!name) {
      return
    }

    counts.set(name, (counts.get(name) ?? 0) + 1)
  })

  return Array.from(counts, ([name, count]) => ({ name, count })).sort((left, right) => {
    if (left.name === PRIORITY_AUTHOR_NAME && right.name !== PRIORITY_AUTHOR_NAME) {
      return -1
    }

    if (left.name !== PRIORITY_AUTHOR_NAME && right.name === PRIORITY_AUTHOR_NAME) {
      return 1
    }

    return left.name.localeCompare(right.name, "ja")
  })
}

export function filterArticles({ articles, author = DEFAULT_AUTHOR }) {
  const normalizedAuthorFilter = author === DEFAULT_AUTHOR ? DEFAULT_AUTHOR : normalizeAuthor(author)

  if (normalizedAuthorFilter === DEFAULT_AUTHOR) {
    return articles ?? []
  }

  return (articles ?? []).filter((article) => normalizeAuthor(article?.author) === normalizedAuthorFilter)
}
