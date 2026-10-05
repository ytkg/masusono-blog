const CHARACTER_COUNT_FORMATTER = new Intl.NumberFormat("ja-JP")

export function formatArticleStats(article) {
  const characterCount = Number(article.characterCount)
  const readingTimeMinutes = Number(article.readingTimeMinutes)

  if (!Number.isFinite(characterCount) || characterCount <= 0) {
    return undefined
  }

  const formattedCharacterCount = CHARACTER_COUNT_FORMATTER.format(characterCount)
  const formattedReadingTimeMinutes = String(readingTimeMinutes)
  const formattedReadingTime =
    Number.isFinite(readingTimeMinutes) && readingTimeMinutes > 0 ? `・約${formattedReadingTimeMinutes}分` : ""

  return `${formattedCharacterCount}字${formattedReadingTime}`
}
