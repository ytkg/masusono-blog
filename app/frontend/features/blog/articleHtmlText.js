import { parseFragment } from "parse5"

const HTML_MARKUP_PATTERN = /[<&]/
const WHITESPACE_PATTERN = /\s+/g
const EXCLUDED_TAGS = new Set(["script", "style", "template", "noscript", "iframe"])
const LINE_BOUNDARY_TAGS = new Set([
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "pre",
  "blockquote",
  "tr",
  "td",
  "th",
])

// Both parsers use inert HTML fragments and preserve the same text boundaries.
export function extractHtmlText(html = "") {
  const source = String(html ?? "")
  if (!HTML_MARKUP_PATTERN.test(source)) return source

  if (import.meta.env.SSR) return readText(parseFragment(source))

  const template = document.createElement("template")
  template.innerHTML = source
  return readText(template.content)
}

export function extractTextFromHtml(html) {
  return extractHtmlText(html).replace(WHITESPACE_PATTERN, " ").trim()
}

function readText(node) {
  if (node.nodeName === "#text") return node.value ?? node.nodeValue
  const tagName = node.tagName?.toLowerCase()
  if (EXCLUDED_TAGS.has(tagName) || node.hasAttribute?.("hidden") || node.attrs?.some(({ name }) => name === "hidden"))
    return ""
  if (tagName === "br") return "\n"

  const text = Array.from(node.childNodes ?? [], readText).join("")
  return LINE_BOUNDARY_TAGS.has(tagName) ? `${text}\n` : text
}
