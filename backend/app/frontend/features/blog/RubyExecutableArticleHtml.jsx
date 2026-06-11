import Box from "@mui/material/Box"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"
import { annotateCodeBlockLanguages } from "./articleCodeBlocks"
import RubyExecutableCodeBlock from "./RubyExecutableCodeBlock"

const PLACEHOLDER_ATTRIBUTE = "data-ruby-executable-placeholder"
const PLACEHOLDER_PATTERN = /<div data-ruby-executable-placeholder="(\d+)"><\/div>/g

function buildExecutableHtmlParts(html) {
  const document = new DOMParser().parseFromString(html, "text/html")
  const blocks = []

  document.body.querySelectorAll("pre > code.language-ruby").forEach((codeElement) => {
    const preElement = codeElement.parentElement
    const placeholder = document.createElement("div")
    const blockId = String(blocks.length)

    blocks.push({
      code: codeElement.textContent ?? "",
      html: preElement.outerHTML,
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
    parts.push({ type: "ruby", block: blocks[Number(match[1])] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < rewrittenHtml.length) {
    parts.push({ type: "html", html: rewrittenHtml.slice(lastIndex) })
  }

  return parts
}

export default function RubyExecutableArticleHtml({ html }) {
  const parts = buildExecutableHtmlParts(html)

  return (
    <Box data-testid="article-body-html" sx={articleBodyHtmlSx}>
      {parts.map((part, index) =>
        part.type === "ruby" ? (
          <RubyExecutableCodeBlock key={index} code={part.block.code} html={part.block.html} />
        ) : (
          <Box
            key={index}
            component="span"
            sx={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: annotateCodeBlockLanguages(part.html) }}
          />
        ),
      )}
    </Box>
  )
}
