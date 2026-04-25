export const DEFAULT_AUTHOR = "all"
export const DEFAULT_YEAR_MONTH = "all"
const PRIORITY_AUTHOR_NAME = "増田"

function normalizeAuthor(author) {
  return typeof author === "string" ? author.trim() : ""
}

function normalizeYearMonth(yearMonth) {
  return typeof yearMonth === "string" ? yearMonth.trim() : ""
}

function getArticleYearMonth(article) {
  const publishedDate = typeof article?.publishedDate === "string" ? article.publishedDate.trim() : ""
  const matched = publishedDate.match(/^(\d{4}\/\d{2})\/\d{2}$/)

  return matched ? matched[1] : ""
}

export function getArticleAuthorOptions(articles, countedArticles = articles) {
  const counts = new Map()
  const names = new Set()

  ;(articles ?? []).forEach((article) => {
    const name = normalizeAuthor(article?.author)

    if (!name) {
      return
    }

    names.add(name)
  })

  ;(countedArticles ?? []).forEach((article) => {
    const name = normalizeAuthor(article?.author)

    if (!name) {
      return
    }

    counts.set(name, (counts.get(name) ?? 0) + 1)
  })

  return Array.from(names, (name) => ({ name, count: counts.get(name) ?? 0 })).sort((left, right) => {
    if (left.name === PRIORITY_AUTHOR_NAME && right.name !== PRIORITY_AUTHOR_NAME) {
      return -1
    }

    if (left.name !== PRIORITY_AUTHOR_NAME && right.name === PRIORITY_AUTHOR_NAME) {
      return 1
    }

    return left.name.localeCompare(right.name, "ja")
  })
}

export function getArticleYearMonthOptions(articles, countedArticles = articles) {
  const counts = new Map()
  const yearMonths = new Set()

  ;(articles ?? []).forEach((article) => {
    const yearMonth = getArticleYearMonth(article)

    if (!yearMonth) {
      return
    }

    yearMonths.add(yearMonth)
  })

  ;(countedArticles ?? []).forEach((article) => {
    const yearMonth = getArticleYearMonth(article)

    if (!yearMonth) {
      return
    }

    counts.set(yearMonth, (counts.get(yearMonth) ?? 0) + 1)
  })

  return Array.from(yearMonths, (yearMonth) => ({ yearMonth, count: counts.get(yearMonth) ?? 0 })).sort(
    (left, right) => right.yearMonth.localeCompare(left.yearMonth, "ja"),
  )
}

export function filterArticles({ articles, author = DEFAULT_AUTHOR, yearMonth = DEFAULT_YEAR_MONTH }) {
  const normalizedAuthorFilter = author === DEFAULT_AUTHOR ? DEFAULT_AUTHOR : normalizeAuthor(author)
  const normalizedYearMonthFilter =
    yearMonth === DEFAULT_YEAR_MONTH ? DEFAULT_YEAR_MONTH : normalizeYearMonth(yearMonth)

  return (articles ?? []).filter((article) => {
    const matchesAuthor =
      normalizedAuthorFilter === DEFAULT_AUTHOR || normalizeAuthor(article?.author) === normalizedAuthorFilter
    const matchesYearMonth =
      normalizedYearMonthFilter === DEFAULT_YEAR_MONTH || getArticleYearMonth(article) === normalizedYearMonthFilter

    return matchesAuthor && matchesYearMonth
  })
}
