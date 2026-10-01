import { supportingActionSx } from "../../shared/supportingActionStyles"
import { lazy, Suspense, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { articleBodyHtmlSx, articleBodyTextSx } from "./articleBodyHtmlSx"
import { extractTextFromHtml } from "./articleHtmlText"

const ArticleStructuredHtml = lazy(() => import("./ArticleStructuredHtml"))

const EXCERPT_MAX_LENGTH = 80
const RICH_HTML_PATTERN = /<(img|figure|iframe|video|audio|table|ul|ol|blockquote)\b/i
const LANGUAGE_CODE_PATTERN = /<pre\b[^>]*>\s*<code\b[^>]*class=["'][^"']*\b(?:language|lang)-/i

function truncateText(text, maxLength = EXCERPT_MAX_LENGTH) {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength)}…`
}

function ArticleRawHtml({ html }) {
  return <Box data-testid="article-body-html" sx={articleBodyHtmlSx} dangerouslySetInnerHTML={{ __html: html }} />
}

function ArticleHtml({ enableRubyRunner, html }) {
  if (LANGUAGE_CODE_PATTERN.test(html)) {
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

  const plainText = extractTextFromHtml(html)
  const excerpt = truncateText(plainText)
  const canExpand = shouldCollapse && (plainText.length > EXCERPT_MAX_LENGTH || RICH_HTML_PATTERN.test(html))
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
          <Button
            variant="text"
            size="small"
            onClick={() => setIsExpanded((current) => !current)}
            sx={{ ...supportingActionSx, my: -1, textAlign: "right" }}
          >
            {isExpanded ? "閉じる" : "続きを読む"}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
