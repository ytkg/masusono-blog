export function formatArticleStats(article) {
  const characterCount = Number(article.characterCount)
  const readingTimeMinutes = Number(article.readingTimeMinutes)

  if (!Number.isFinite(characterCount) || characterCount <= 0) {
    return undefined
  }

  const formattedCharacterCount = new Intl.NumberFormat("ja-JP").format(characterCount)
  const formattedReadingTimeMinutes = String(readingTimeMinutes)
  const formattedReadingTime =
    Number.isFinite(readingTimeMinutes) && readingTimeMinutes > 0 ? `・約${formattedReadingTimeMinutes}分` : ""

  return `${formattedCharacterCount}字${formattedReadingTime}`
}
