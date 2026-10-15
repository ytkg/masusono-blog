import { LANGUAGE_CODE_PATTERN } from "./codeBlockLanguage"
import { lazy, Suspense, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"

const ArticleStructuredHtml = lazy(() => import("./ArticleStructuredHtml"))

function ArticleRawHtml({ html }) {
  return <Box data-testid="article-body-html" sx={articleBodyHtmlSx} dangerouslySetInnerHTML={{ __html: html }} />
}

export default function ArticleHtml({ enableRubyRunner, html }) {
  const hasCode = LANGUAGE_CODE_PATTERN.test(html)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (hasCode) setMounted(true)
  }, [hasCode])

  // Code controls need browser APIs; keep their initial HTML identical during hydration.
  if (mounted && hasCode) {
    return (
      <Suspense fallback={<ArticleRawHtml html={html} />}>
        <ArticleStructuredHtml enableRubyRunner={enableRubyRunner} html={html} />
      </Suspense>
    )
  }

  return <ArticleRawHtml html={html} />
}
