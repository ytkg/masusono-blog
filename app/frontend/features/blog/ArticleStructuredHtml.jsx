import { useLayoutEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import Box from "@mui/material/Box"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"
import CodeBlock from "./CodeBlock"
import { buildHtmlParts } from "./articleStructuredHtmlParts"
import RubyExecutableCodeBlock from "./RubyExecutableCodeBlock"

export default function ArticleStructuredHtml({ enableRubyRunner = false, html }) {
  const { nodes, blocks } = useMemo(() => buildHtmlParts(html), [html])
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    // Keep the original ancestors intact while React owns only the code controls.
    container.replaceChildren(...nodes)
    return () => container.replaceChildren()
  }, [nodes])

  return (
    <Box ref={containerRef} data-testid="article-body-html" sx={articleBodyHtmlSx}>
      {blocks.map(({ target, block, isRuby, html }, index) =>
        createPortal(
          isRuby && enableRubyRunner ? (
            <RubyExecutableCodeBlock code={block.code} html={html} />
          ) : (
            <CodeBlock block={block} />
          ),
          target,
          index,
        ),
      )}
    </Box>
  )
}
