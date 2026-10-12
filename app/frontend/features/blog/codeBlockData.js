import { codeLanguage } from "./codeBlockLanguage"

export function buildCodeBlockDataFromElement(codeElement) {
  if (!codeElement) return undefined

  const language = codeLanguage(codeElement)
  if (!language) return undefined

  return {
    code: codeElement.textContent ?? "",
    languageKey: language.key,
    languageLabel: language.label,
    prismLanguage: language.prismLanguage,
  }
}

export function buildCodeBlockDataFromHtml(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  return buildCodeBlockDataFromElement(document.body.querySelector("pre > code"))
}
