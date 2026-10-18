import { HTML_BLOCK_TAGS } from "@/shared/lib/htmlBlockTags"

const EXCLUDED_TAGS = new Set(["script", "style", "iframe", "template", "noscript"])
const TEXT_NODE = 3
const ELEMENT_NODE = 1

export function buildArticleCopyText(article) {
  const document = new DOMParser().parseFromString(article.content ?? "", "text/html")

  const body = readCopyNode(document.body).trim()
  return [article.title?.trim(), body].filter(Boolean).join("\n\n")
}

function readCopyNode(node, inPre = false) {
  if (node.nodeType === TEXT_NODE) return inPre ? node.textContent : node.textContent.replace(/\s+/g, " ")
  if (node.nodeType !== ELEMENT_NODE) return ""
  const tag = node.tagName.toLowerCase()
  if (EXCLUDED_TAGS.has(tag) || node.hasAttribute("hidden")) return ""
  if (tag === "br") return "\n"
  const text = Array.from(node.childNodes, (child) => readCopyNode(child, inPre || tag === "pre")).join("")
  if (["td", "th"].includes(tag)) return `${text}\t`
  if (!HTML_BLOCK_TAGS.has(tag)) return text
  const blockText = tag === "pre" ? text : text.replace(/^\n+|\n+$/g, "")
  return `\n${blockText}\n`
}
