const LANGUAGE_CONFIGS = {
  bash: { label: "Bash", grammar: "shell" },
  css: { label: "CSS", grammar: "css" },
  html: { label: "HTML", grammar: "html" },
  javascript: { label: "JavaScript", grammar: "javascript" },
  js: { label: "JavaScript", grammar: "javascript" },
  json: { label: "JSON", grammar: "json" },
  ruby: { label: "Ruby", grammar: "ruby" },
  sh: { label: "Shell", grammar: "shell" },
  shell: { label: "Shell", grammar: "shell" },
  sql: { label: "SQL", grammar: "sql" },
  ts: { label: "TypeScript", grammar: "javascript" },
  typescript: { label: "TypeScript", grammar: "javascript" },
}

function codeLanguage(codeElement) {
  const classNames = Array.from(codeElement.classList)
  const languageClass = classNames.find((className) => className.startsWith("language-") || className.startsWith("lang-"))
  const rawLanguage = languageClass?.replace(/^(language|lang)-/, "") || classNames.find((className) => LANGUAGE_CONFIGS[className])
  const normalizedLanguage = rawLanguage?.toLowerCase()
  const config = LANGUAGE_CONFIGS[normalizedLanguage]

  return rawLanguage ? { label: config?.label || rawLanguage, grammar: config?.grammar } : undefined
}

function codeLines(code) {
  const normalizedCode = code.endsWith("\n") ? code.slice(0, -1) : code
  const lines = normalizedCode.split("\n")

  return lines.length ? lines : [""]
}

function tokenPatterns(grammar) {
  switch (grammar) {
    case "css":
      return [
        ["comment", /\/\*.*?\*\//y],
        ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
        ["property", /-?[_a-zA-Z][\w-]*(?=\s*:)/y],
        ["number", /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b/y],
      ]
    case "html":
      return [
        ["comment", /<!--.*?-->/y],
        ["tag", /<\/?[\w:-]+|\/?>/y],
        ["property", /\s[\w:-]+(?==)/y],
        ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
      ]
    case "javascript":
      return [
        ["comment", /\/\/.*|\/\*.*?\*\//y],
        ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y],
        ["keyword", /\b(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|let|new|null|return|switch|this|throw|true|try|typeof|undefined|var|while)\b/y],
        ["number", /\b\d+(?:\.\d+)?\b/y],
        ["property", /\b[A-Za-z_$][\w$]*(?=\s*:)/y],
      ]
    case "json":
      return [
        ["property", /"(?:\\.|[^"\\])*"(?=\s*:)/y],
        ["string", /"(?:\\.|[^"\\])*"/y],
        ["keyword", /\b(?:false|null|true)\b/y],
        ["number", /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/iy],
      ]
    case "ruby":
      return [
        ["comment", /#.*/y],
        ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
        ["symbol", /:[A-Za-z_]\w*[!?=]?/y],
        ["keyword", /\b(?:BEGIN|END|alias|and|begin|break|case|class|def|defined\?|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield)\b/y],
        ["constant", /\b[A-Z][A-Za-z0-9_]*\b/y],
        ["number", /\b\d+(?:\.\d+)?\b/y],
      ]
    case "shell":
      return [
        ["comment", /#.*/y],
        ["string", /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y],
        ["keyword", /\b(?:case|do|done|elif|else|esac|fi|for|function|if|in|then|until|while)\b/y],
        ["property", /\$[A-Za-z_]\w*/y],
      ]
    case "sql":
      return [
        ["comment", /--.*|\/\*.*?\*\//y],
        ["string", /'(?:''|[^'])*'/y],
        ["keyword", /\b(?:alter|and|as|by|create|delete|desc|distinct|drop|from|group|having|in|insert|into|join|left|limit|not|null|on|or|order|right|select|set|table|update|values|where)\b/iy],
        ["number", /\b\d+(?:\.\d+)?\b/y],
      ]
    default:
      return []
  }
}

function lineTokens(line, grammar) {
  const patterns = tokenPatterns(grammar)
  const tokens = []
  let index = 0

  while (index < line.length) {
    const match = patterns
      .map(([type, pattern]) => {
        pattern.lastIndex = index
        const result = pattern.exec(line)
        return result ? { type, text: result[0] } : undefined
      })
      .find(Boolean)

    if (match) {
      tokens.push(match)
      index += match.text.length
    } else {
      tokens.push({ text: line[index] })
      index += 1
    }
  }

  return tokens
}

function appendHighlightedLine(document, contentElement, line, grammar) {
  const tokens = grammar ? lineTokens(line, grammar) : [{ text: line }]

  tokens.forEach((token) => {
    if (!token.type) {
      contentElement.append(document.createTextNode(token.text))
      return
    }

    const tokenElement = document.createElement("span")
    tokenElement.setAttribute("data-code-token", token.type)
    tokenElement.textContent = token.text
    contentElement.append(tokenElement)
  })
}

function replaceCodeWithNumberedLines(document, codeElement, grammar) {
  const fragment = document.createDocumentFragment()

  codeLines(codeElement.textContent ?? "").forEach((line, index) => {
    const lineElement = document.createElement("span")
    const numberElement = document.createElement("span")
    const contentElement = document.createElement("span")

    lineElement.setAttribute("data-code-line", "")
    numberElement.setAttribute("data-code-line-number", "")
    numberElement.textContent = String(index + 1).padStart(3, "0")
    contentElement.setAttribute("data-code-line-content", "")
    appendHighlightedLine(document, contentElement, line || " ", grammar)
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
      codeElement.parentElement?.setAttribute("data-code-language", language.label)
      replaceCodeWithNumberedLines(document, codeElement, language.grammar)
    }
  })

  return document.body.innerHTML
}
