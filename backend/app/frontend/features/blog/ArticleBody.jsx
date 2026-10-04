import { supportingActionSx } from "../../shared/supportingActionStyles"
import { lazy, Suspense, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { articleBodyHtmlSx, articleBodyTextSx } from "./articleBodyHtmlSx"
import { buildArticleExcerpt } from "./articleExcerpt"

const ArticleStructuredHtml = lazy(() => import("./ArticleStructuredHtml"))

const LANGUAGE_CODE_PATTERN = /<pre\b[^>]*>\s*<code\b[^>]*class=["'][^"']*\b(?:language|lang)-/i

function ArticleRawHtml({ html }) {
  return <Box data-testid="article-body-html" sx={articleBodyHtmlSx} dangerouslySetInnerHTML={{ __html: html }} />
}

function ArticleHtml({ enableRubyRunner, html }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (LANGUAGE_CODE_PATTERN.test(html)) setMounted(true)
  }, [html])

  // Code controls need browser APIs; keep their initial HTML identical during hydration.
  if (mounted && LANGUAGE_CODE_PATTERN.test(html)) {
    return (
      <Suspense fallback={<ArticleRawHtml html={html} />}>
        <ArticleStructuredHtml enableRubyRunner={enableRubyRunner} html={html} />
      </Suspense>
    )
  }

  return <ArticleRawHtml html={html} />
}

export default function ArticleBody({ enableRubyRunner = false, html, hasBody, shouldCollapse }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!hasBody) {
    return <Typography color="text.secondary">本文がありません。</Typography>
  }

  const { excerpt, canExpand } = buildArticleExcerpt(html, shouldCollapse)
  const showsHtml = !shouldCollapse || isExpanded || !canExpand
  const showsRubyRunner = enableRubyRunner && showsHtml

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      {showsHtml ? (
        <ArticleHtml enableRubyRunner={showsRubyRunner} html={html} />
      ) : (
        <Typography sx={{ ...articleBodyTextSx, color: "text.primary", overflowWrap: "anywhere" }}>
          {excerpt}
        </Typography>
      )}
      {canExpand ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box
            component="button"
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            sx={{
              ...supportingActionSx,
              minHeight: 0,
              minWidth: 0,
              p: 0,
              border: 0,
              bgcolor: "transparent",
              fontFamily: "inherit",
              cursor: "pointer",
              textAlign: "right",
            }}
          >
            {isExpanded ? "閉じる" : "続きを読む"}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
