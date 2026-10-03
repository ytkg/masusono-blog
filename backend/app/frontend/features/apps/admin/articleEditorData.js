export function toJapanDateInput(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return ""
  return new Date(date.valueOf() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)
}

export function editorFields(article) {
  return {
    title: article.title || "",
    content: article.content || "",
    author: article.author_id || "",
    publishedAt: toJapanDateInput(article.published_at),
  }
}

export function changedFields(fields, initial) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([key, value]) => value !== initial[key])
      .map(([key, value]) => [
        key,
        key === "publishedAt" ? new Date(`${value}+09:00`).toISOString() : key === "author" ? value || null : value,
      ]),
  )
}

// Conservative round-trip comparison: an unsupported element or lost attribute locks body editing.
export function comparableHtml(html) {
  const template = document.createElement("template")
  template.innerHTML = html
  function serialize(node) {
    if (node.nodeType === Node.TEXT_NODE) return JSON.stringify(node.textContent)
    if (node.nodeType !== Node.ELEMENT_NODE) return ""
    const tag = { b: "strong", i: "em", strike: "s" }[node.localName] || node.localName
    const children = [...node.childNodes].map(serialize).join("")
    if (
      tag === "p" &&
      node.parentElement?.localName === "li" &&
      node.parentElement.children.length === 1 &&
      node.attributes.length === 0
    )
      return children
    const attrs = [...node.attributes].map(({ name, value }) => [name, value]).sort(([a], [b]) => a.localeCompare(b))
    return JSON.stringify([tag, attrs, children])
  }
  return [...template.content.childNodes]
    .filter((node) => node.nodeType !== Node.TEXT_NODE || node.textContent.trim())
    .map(serialize)
    .join("")
}
