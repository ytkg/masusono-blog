import Box from "@mui/material/Box"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"
import CodeBlock from "./CodeBlock"
import { buildHtmlParts } from "./articleStructuredHtmlParts"
import RubyExecutableCodeBlock from "./RubyExecutableCodeBlock"

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
