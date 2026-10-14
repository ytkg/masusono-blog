import { truncateText } from "@/shared/lib/truncateText"
import { extractTextFromHtml } from "./articleHtmlText"

const EXCERPT_MAX_LENGTH = 80
const RICH_HTML_PATTERN = /<(img|figure|iframe|video|audio|table|ul|ol|blockquote)\b/i

export function buildArticleExcerpt(html, shouldCollapse) {
  const plainText = extractTextFromHtml(html)
  const excerpt = truncateText(plainText, EXCERPT_MAX_LENGTH) + (plainText.length > EXCERPT_MAX_LENGTH ? "…" : "")
  const canExpand = shouldCollapse && (plainText.length > EXCERPT_MAX_LENGTH || RICH_HTML_PATTERN.test(html))
  return { excerpt, canExpand }
}
