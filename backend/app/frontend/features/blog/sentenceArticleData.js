import { extractHtmlText } from "./articleHtmlText"

const SENTENCE_END_PATTERN = /[。！？!?]+[」』）)］\]｝}”’】〕〉》〙〗〟'"]*|\n/g

const SENTENCE_CLOSING_MARK_PATTERN = /[」』）)］\]｝}”’】〕〉》〙〗〟'"]$/
const SENTENCE_CONTINUATION_PATTERN = /^[ぁ-んァ-ヶー一-龠々〆ヵヶA-Za-z0-9]/

export function firstSentenceFromHtml(html = "") {
  const text = extractHtmlText(html)
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim()
  const match = firstSentenceBoundary(text)

  if (match) return text.slice(0, match.index + match[0].length).trim()
  const end = /[\uD800-\uDBFF]/.test(text[79]) ? 79 : 80
  return text.slice(0, end)
}

function firstSentenceBoundary(text) {
  for (const candidate of text.matchAll(SENTENCE_END_PATTERN)) {
    const end = candidate[0]
    const nextCharacter = text[candidate.index + end.length] || ""
    const hasClosingMark = SENTENCE_CLOSING_MARK_PATTERN.test(end)

    if (end === "\n" || !hasClosingMark || !SENTENCE_CONTINUATION_PATTERN.test(nextCharacter)) {
      return candidate
    }
  }
}

export function prepareSentenceArticles(articles) {
  return articles
    .map((article) => ({ ...article, sentence: firstSentenceFromHtml(article.content) }))
    .filter((article) => article.id && article.sentence)
}
