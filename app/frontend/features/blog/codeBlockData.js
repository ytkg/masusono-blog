import { codeLanguage } from "./codeBlockLanguage"

export function buildCodeBlockDataFromElement(codeElement) {
  if (!codeElement) return undefined

  const language = codeLanguage(codeElement)
  if (!language) return undefined

  const source = codeElement.cloneNode(true)
  source.querySelectorAll("br").forEach((lineBreak) => lineBreak.replaceWith("\n"))

  return {
    code: source.textContent ?? "",
    languageKey: language.key,
    languageLabel: language.label,
    prismLanguage: language.prismLanguage,
  }
}

export function buildCodeBlockDataFromHtml(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  return buildCodeBlockDataFromElement(document.body.querySelector("pre > code"))
}
