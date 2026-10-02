import Box from "@mui/material/Box"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"
import CodeBlock from "./CodeBlock"
import { buildCodeBlockDataFromElement } from "./codeBlockData"
import RubyExecutableCodeBlock from "./RubyExecutableCodeBlock"

const PLACEHOLDER_ATTRIBUTE = "data-structured-code-block-placeholder"
const PLACEHOLDER_PATTERN = /<div data-structured-code-block-placeholder="(\d+)"><\/div>/g

function buildHtmlParts(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  const blocks = []

  document.body.querySelectorAll("pre > code").forEach((codeElement) => {
    const preElement = codeElement.parentElement
    if (!preElement) return

    const blockHtml = preElement.outerHTML
    const block = buildCodeBlockDataFromElement(codeElement)
    if (!block) return

    const placeholder = document.createElement("div")
    const blockId = String(blocks.length)

    blocks.push({
      block,
      html: blockHtml,
      isRuby: block.languageKey === "ruby",
    })
    placeholder.setAttribute(PLACEHOLDER_ATTRIBUTE, blockId)
    preElement.replaceWith(placeholder)
  })

  const parts = []
  const rewrittenHtml = document.body.innerHTML
  let lastIndex = 0
  let match

  while ((match = PLACEHOLDER_PATTERN.exec(rewrittenHtml))) {
    if (match.index > lastIndex) {
      parts.push({ type: "html", html: rewrittenHtml.slice(lastIndex, match.index) })
    }

    parts.push({ type: "code", block: blocks[Number(match[1])] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < rewrittenHtml.length) {
    parts.push({ type: "html", html: rewrittenHtml.slice(lastIndex) })
  }

  return parts
}

export default function ArticleStructuredHtml({ enableRubyRunner = false, html }) {
  const parts = buildHtmlParts(html)

  return (
    <Box data-testid="article-body-html" sx={articleBodyHtmlSx}>
      {parts.map((part, index) =>
        part.type === "code" ? (
          part.block.isRuby && enableRubyRunner ? (
            <RubyExecutableCodeBlock key={index} code={part.block.block.code} html={part.block.html} />
          ) : (
            <CodeBlock key={index} block={part.block.block} />
          )
        ) : (
          <Box
            key={index}
            component="span"
            sx={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: part.html }}
          />
        ),
      )}
    </Box>
  )
}
