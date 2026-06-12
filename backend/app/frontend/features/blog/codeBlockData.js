const LANGUAGE_CONFIGS = {
  bash: { label: "Bash", prismLanguage: "bash" },
  css: { label: "CSS", prismLanguage: "css" },
  html: { label: "HTML", prismLanguage: "markup" },
  javascript: { label: "JavaScript", prismLanguage: "javascript" },
  js: { label: "JavaScript", prismLanguage: "javascript" },
  json: { label: "JSON", prismLanguage: "json" },
  ruby: { label: "Ruby", prismLanguage: "ruby" },
  sh: { label: "Shell", prismLanguage: "bash" },
  shell: { label: "Shell", prismLanguage: "bash" },
  sql: { label: "SQL", prismLanguage: "sql" },
  ts: { label: "TypeScript", prismLanguage: "typescript" },
  typescript: { label: "TypeScript", prismLanguage: "typescript" },
}

function codeLanguage(codeElement) {
  const classNames = Array.from(codeElement.classList)
  const languageClass = classNames.find((className) => className.startsWith("language-") || className.startsWith("lang-"))
  const rawLanguage = languageClass?.replace(/^(language|lang)-/, "") || classNames.find((className) => LANGUAGE_CONFIGS[className])
  const normalizedLanguage = rawLanguage?.toLowerCase()
  const config = LANGUAGE_CONFIGS[normalizedLanguage]

  if (!rawLanguage) return undefined

  return {
    key: normalizedLanguage,
    label: config?.label || rawLanguage,
    prismLanguage: config?.prismLanguage || normalizedLanguage,
  }
}

export function buildCodeBlockDataFromHtml(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  const codeElement = document.body.querySelector("pre > code")

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
