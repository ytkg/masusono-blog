const HTML_TAG_PATTERN = /<[^>]*>/g
const HTML_ENTITY_PATTERN = /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi
const HTML_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

function decodeHtmlEntity(entity) {
  const normalizedEntity = entity.toLowerCase()

  if (normalizedEntity.startsWith("#x")) {
    return String.fromCodePoint(Number.parseInt(normalizedEntity.slice(2), 16))
  }

  if (normalizedEntity.startsWith("#")) {
    return String.fromCodePoint(Number.parseInt(normalizedEntity.slice(1), 10))
  }

  return HTML_ENTITIES[normalizedEntity] ?? `&${entity};`
}

export function extractTextFromHtml(html) {
  if (!html.trim()) {
    return ""
  }

  return html
    .replace(HTML_TAG_PATTERN, " ")
    .replace(HTML_ENTITY_PATTERN, (_, entity) => decodeHtmlEntity(entity))
    .replace(/\s+/g, " ")
    .trim()
}
