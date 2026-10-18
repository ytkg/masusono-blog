import { buildCodeBlockDataFromElement } from "./codeBlockData"

export function buildHtmlParts(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  const blocks = []

  document.body.querySelectorAll("pre > code").forEach((codeElement) => {
    const preElement = codeElement.parentElement
    // Preserve native hidden boundaries instead of flattening them into visible code.
    if (preElement.closest("[hidden]") || preElement.querySelector("[hidden]")) return
    const block = buildCodeBlockDataFromElement(codeElement)
    if (!block) return

    const target = document.createElement("div")
    target.style.display = "contents"
    blocks.push({ target, block, html: preElement.outerHTML, isRuby: block.languageKey === "ruby" })
    preElement.replaceWith(target)
  })

  return { nodes: Array.from(document.body.childNodes), blocks }
}
