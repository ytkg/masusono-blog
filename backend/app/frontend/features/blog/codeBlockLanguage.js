const LANGUAGE_CONFIGS = Object.freeze({
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
})

function rawCodeLanguage(codeElement) {
  const classNames = Array.from(codeElement.classList)
  const languageClass = classNames.find(
    (className) => className.startsWith("language-") || className.startsWith("lang-"),
  )
  return languageClass?.replace(/^(language|lang)-/, "") || classNames.find((className) => LANGUAGE_CONFIGS[className])
}

export function codeLanguage(codeElement) {
  const rawLanguage = rawCodeLanguage(codeElement)
  const normalizedLanguage = rawLanguage?.toLowerCase()
  const config = LANGUAGE_CONFIGS[normalizedLanguage]

  if (!rawLanguage) return undefined

  return {
    key: normalizedLanguage,
    label: config?.label || rawLanguage,
    prismLanguage: config?.prismLanguage || normalizedLanguage,
  }
}
