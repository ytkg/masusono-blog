import { extractTextFromHtml } from "./articleHtmlText"

export function normalizeArticleSearchText(value) {
  return extractTextFromHtml(value).toLowerCase()
}
