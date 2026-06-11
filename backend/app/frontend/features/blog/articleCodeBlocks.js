const LANGUAGE_LABELS = {
  bash: "Bash",
  css: "CSS",
  html: "HTML",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  ruby: "Ruby",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  typescript: "TypeScript",
}

function codeLanguage(codeElement) {
  const classNames = Array.from(codeElement.classList)
  const languageClass = classNames.find((className) => className.startsWith("language-") || className.startsWith("lang-"))
  const rawLanguage = languageClass?.replace(/^(language|lang)-/, "") || classNames.find((className) => LANGUAGE_LABELS[className])

  return rawLanguage ? LANGUAGE_LABELS[rawLanguage.toLowerCase()] || rawLanguage : undefined
}

function codeLines(code) {
  const normalizedCode = code.endsWith("\n") ? code.slice(0, -1) : code
  const lines = normalizedCode.split("\n")

  return lines.length ? lines : [""]
}

function replaceCodeWithNumberedLines(document, codeElement) {
  const fragment = document.createDocumentFragment()

  codeLines(codeElement.textContent ?? "").forEach((line, index) => {
    const lineElement = document.createElement("span")
    const numberElement = document.createElement("span")
    const contentElement = document.createElement("span")

    lineElement.setAttribute("data-code-line", "")
    numberElement.setAttribute("data-code-line-number", "")
    numberElement.textContent = String(index + 1)
    contentElement.setAttribute("data-code-line-content", "")
    contentElement.textContent = line || " "
    lineElement.append(numberElement, contentElement)
    fragment.append(lineElement)
  })

  codeElement.replaceChildren(fragment)
}

export function annotateCodeBlockLanguages(html) {
  const document = new DOMParser().parseFromString(html, "text/html")

  document.body.querySelectorAll("pre > code").forEach((codeElement) => {
    const language = codeLanguage(codeElement)

    if (language) {
      codeElement.parentElement?.setAttribute("data-code-language", language)
      replaceCodeWithNumberedLines(document, codeElement)
    }
  })

  return document.body.innerHTML
}
