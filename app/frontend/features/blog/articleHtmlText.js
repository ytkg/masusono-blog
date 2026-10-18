import { HTML_BLOCK_TAGS } from "@/shared/lib/htmlBlockTags"
import { parseFragment } from "parse5"

const HTML_MARKUP_PATTERN = /[<&]/
const WHITESPACE_PATTERN = /\s+/g
const EXCLUDED_TAGS = new Set(["script", "style", "template", "noscript", "iframe"])

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

  let text = ""
  for (const child of node.childNodes ?? []) {
    const childText = readText(child)
    if (
      childText &&
      HTML_BLOCK_TAGS.has(child.tagName?.toLowerCase()) &&
      text &&
      !text.endsWith("\n") &&
      !childText.startsWith("\n")
    )
      text += "\n"
    text += childText
  }
  return HTML_BLOCK_TAGS.has(tagName) ? `${text}\n` : text
}
