import { parseFragment } from "parse5"

const LINE_BOUNDARY_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"])

// Use the same inert HTML parser in Node and the browser so excerpts hydrate identically.
export function extractHtmlText(html = "") {
  const source = String(html ?? "")
  if (!/[<&]/.test(source)) return source

  return readText(parseFragment(source))
}

export function extractTextFromHtml(html) {
  return extractHtmlText(html).replace(/\s+/g, " ").trim()
}

function readText(node) {
  if (node.nodeName === "#text") return node.value
  if (node.tagName === "br") return "\n"

  const text = (node.childNodes ?? []).map(readText).join("")
  return LINE_BOUNDARY_TAGS.has(node.tagName) ? `${text}\n` : text
}
