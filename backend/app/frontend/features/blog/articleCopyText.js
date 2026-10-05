const EXCLUDED_TAGS = ["SCRIPT", "STYLE", "IFRAME"]

const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "SECTION",
  "ARTICLE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "PRE",
  "TR",
  "FIGCAPTION",
])

export function buildArticleCopyText(article) {
  const document = new DOMParser().parseFromString(article.content ?? "", "text/html")

  const body = readCopyNode(document.body).trim()
  return [article.title?.trim(), body].filter(Boolean).join("\n\n")
}

function readCopyNode(node, inPre = false) {
  if (node.nodeType === 3) return inPre ? node.textContent : node.textContent.replace(/\s+/g, " ")
  if (node.nodeType !== 1) return ""
  const tag = node.tagName
  if (EXCLUDED_TAGS.includes(tag)) return ""
  if (tag === "BR") return "\n"
  let text = ""
  for (const child of node.childNodes) {
    text += readCopyNode(child, inPre || tag === "PRE")
  }
  if (["TD", "TH"].includes(tag)) return `${text}\t`
  if (!BLOCK_TAGS.has(tag)) return text
  const blockText = tag === "PRE" ? text : text.replace(/^\n+|\n+$/g, "")
  return `\n${blockText}\n`
}
