export function buildArticleSearchTerm(prefix, value) {
  const text = String(value).replace(/\s+/g, " ").trim()
  const quoted = /[\s"\\]/.test(text) ? `"${text.replace(/["\\]/g, "\\$&")}"` : text
  return `${prefix}${quoted}`
}
