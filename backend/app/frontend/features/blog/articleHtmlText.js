import { parseFragment } from "parse5"

const LINE_BOUNDARY_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"])

// Both parsers use inert HTML fragments and preserve the same text boundaries.
export function extractHtmlText(html = "") {
  const source = String(html ?? "")
  if (!/[<&]/.test(source)) return source

  if (import.meta.env.SSR) return readText(parseFragment(source))

  const template = document.createElement("template")
  template.innerHTML = source
  return readText(template.content)
}

export function extractTextFromHtml(html) {
  return extractHtmlText(html).replace(/\s+/g, " ").trim()
}

function readText(node) {
  if (node.nodeName === "#text") return node.value ?? node.nodeValue
  const tagName = node.tagName?.toLowerCase()
  if (tagName === "br") return "\n"

  let text = ""
  for (const child of node.childNodes ?? []) {
    text += readText(child)
  }
  return LINE_BOUNDARY_TAGS.has(tagName) ? `${text}\n` : text
}
