import { extractTextFromHtml } from "./articleHtmlText"

const EXCERPT_MAX_LENGTH = 80
const RICH_HTML_PATTERN = /<(img|figure|iframe|video|audio|table|ul|ol|blockquote)\b/i

function truncateText(text) {
  if (text.length <= EXCERPT_MAX_LENGTH) {
    return text
  }

  const end = /[\uD800-\uDBFF]/.test(text[EXCERPT_MAX_LENGTH - 1]) ? EXCERPT_MAX_LENGTH - 1 : EXCERPT_MAX_LENGTH
  return `${text.slice(0, end)}…`
}

export function buildArticleExcerpt(html, shouldCollapse) {
  const plainText = extractTextFromHtml(html)
  const excerpt = truncateText(plainText)
  const canExpand = shouldCollapse && (plainText.length > EXCERPT_MAX_LENGTH || RICH_HTML_PATTERN.test(html))
  return { excerpt, canExpand }
}
