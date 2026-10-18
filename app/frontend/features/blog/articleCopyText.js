import { HTML_BLOCK_TAGS } from "@/shared/lib/htmlBlockTags"

const EXCLUDED_TAGS = new Set(["script", "style", "iframe", "template", "noscript"])
const TEXT_NODE = 3
const ELEMENT_NODE = 1

export function buildArticleCopyText(article) {
  const document = new DOMParser().parseFromString(article.content ?? "", "text/html")
  const body = joinParts(trimParts(readCopyNode(document.body), /^\s+/, /\s+$/))
  return [article.title?.trim(), body].filter(Boolean).join("\n\n")
}

function readCopyNode(node, inPre = false) {
  if (node.nodeType === TEXT_NODE) return [inPre ? node.textContent : node.textContent.replace(/\s+/g, " ")]
  if (node.nodeType !== ELEMENT_NODE) return []
  const tag = node.tagName.toLowerCase()
  if (EXCLUDED_TAGS.has(tag) || node.hasAttribute("hidden")) return []
  if (tag === "br") return ["\n"]
  const parts = Array.from(node.childNodes).flatMap((child) => readCopyNode(child, inPre || tag === "pre"))
  if (tag === "pre") return ["\n", { code: joinParts(parts) }, "\n"]
  if (["td", "th"].includes(tag)) return [...parts, "\t"]
  if (!HTML_BLOCK_TAGS.has(tag)) return parts
  return ["\n", ...trimParts(parts, /^\n+/, /\n+$/), "\n"]
}

function joinParts(parts) {
  return parts.map((part) => (typeof part === "string" ? part : part.code)).join("")
}

function trimParts(parts, startPattern, endPattern) {
  const trimmed = [...parts]
  while (typeof trimmed[0] === "string") {
    trimmed[0] = trimmed[0].replace(startPattern, "")
    if (trimmed[0]) break
    trimmed.shift()
  }
  while (typeof trimmed.at(-1) === "string") {
    trimmed[trimmed.length - 1] = trimmed.at(-1).replace(endPattern, "")
    if (trimmed.at(-1)) break
    trimmed.pop()
  }
  return trimmed
}
