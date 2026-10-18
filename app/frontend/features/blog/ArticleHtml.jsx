import { codeLanguage } from "./codeBlockLanguage"
import { lazy, Suspense, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"

const ArticleStructuredHtml = lazy(() => import("./ArticleStructuredHtml"))

function ArticleRawHtml({ html }) {
  return <Box data-testid="article-body-html" sx={articleBodyHtmlSx} dangerouslySetInnerHTML={{ __html: html }} />
}

export default function ArticleHtml({ enableRubyRunner, html }) {
  const [hasCode, setHasCode] = useState(false)
  useEffect(() => {
    if (!/<pre\b/i.test(html)) {
      setHasCode(false)
      return
    }
    const document = new DOMParser().parseFromString(html, "text/html")
    setHasCode(Array.from(document.body.querySelectorAll("pre > code")).some(codeLanguage))
  }, [html])

  // Code controls need browser APIs; keep their initial HTML identical during hydration.
  if (hasCode) {
    return (
      <Suspense fallback={<ArticleRawHtml html={html} />}>
        <ArticleStructuredHtml enableRubyRunner={enableRubyRunner} html={html} />
      </Suspense>
    )
  }

  return <ArticleRawHtml html={html} />
}
