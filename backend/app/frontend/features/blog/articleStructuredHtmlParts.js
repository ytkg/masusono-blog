import { buildCodeBlockDataFromElement } from "./codeBlockData"

const PLACEHOLDER_ATTRIBUTE = "data-structured-code-block-placeholder"
const PLACEHOLDER_PATTERN = /<div data-structured-code-block-placeholder="(\d+)"><\/div>/g

export function buildHtmlParts(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  const blocks = []

  document.body.querySelectorAll("pre > code").forEach((codeElement) => {
    const preElement = codeElement.parentElement
    if (!preElement) return

    const blockHtml = preElement.outerHTML
    const block = buildCodeBlockDataFromElement(codeElement)
    if (!block) return

    const placeholder = document.createElement("div")
    const blockId = String(blocks.length)

    blocks.push({
      block,
      html: blockHtml,
      isRuby: block.languageKey === "ruby",
    })
    placeholder.setAttribute(PLACEHOLDER_ATTRIBUTE, blockId)
    preElement.replaceWith(placeholder)
  })

  const parts = []
  const rewrittenHtml = document.body.innerHTML
  let lastIndex = 0
  let match

  while ((match = PLACEHOLDER_PATTERN.exec(rewrittenHtml))) {
    if (match.index > lastIndex) {
      parts.push({ type: "html", html: rewrittenHtml.slice(lastIndex, match.index) })
    }

    parts.push({ type: "code", block: blocks[Number(match[1])] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < rewrittenHtml.length) {
    parts.push({ type: "html", html: rewrittenHtml.slice(lastIndex) })
  }

  return parts
}
