import { buildCodeBlockDataFromElement } from "./codeBlockData"

export function buildHtmlParts(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  const blocks = []

  document.body.querySelectorAll("pre > code").forEach((codeElement) => {
    const preElement = codeElement.parentElement
    const block = buildCodeBlockDataFromElement(codeElement)
    if (!block) return

    const target = document.createElement("div")
    target.style.display = "contents"
    blocks.push({ target, block, html: preElement.outerHTML, isRuby: block.languageKey === "ruby" })
    preElement.replaceWith(target)
  })

  return { nodes: Array.from(document.body.childNodes), blocks }
}
