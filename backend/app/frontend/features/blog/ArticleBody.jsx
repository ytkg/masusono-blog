import { useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"

const EXCERPT_MAX_LENGTH = 80
const RICH_HTML_PATTERN = /<(img|figure|iframe|video|audio|table|ul|ol|blockquote)\b/i
const supportingTextSx = { fontSize: "12px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }

function extractTextFromHtml(html) {
  if (!html.trim()) {
    return ""
  }

  if (typeof document === "undefined") {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  const container = document.createElement("div")
  container.innerHTML = html

  return container.textContent.replace(/\s+/g, " ").trim()
}

function truncateText(text, maxLength = EXCERPT_MAX_LENGTH) {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength)}…`
}

export default function ArticleBody({ html, hasBody, shouldCollapse }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!hasBody) {
    return <Typography color="text.secondary">本文がありません。</Typography>
  }

  const plainText = extractTextFromHtml(html)
  const excerpt = truncateText(plainText)
  const canExpand = shouldCollapse && (plainText.length > EXCERPT_MAX_LENGTH || RICH_HTML_PATTERN.test(html))
  const showsHtml = !shouldCollapse || isExpanded || !canExpand

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      {showsHtml ? (
        <Box
          data-testid="article-body-html"
          sx={{
            color: "text.secondary",
            "& img": { maxWidth: "100%", height: "auto", borderRadius: "12px" },
            "& p": { margin: "0 0 1em" },
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            "& a": {
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              textDecoration: "underline",
            },
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <Typography color="text.secondary" sx={{ lineHeight: 1.8, overflowWrap: "anywhere" }}>
          {excerpt}
        </Typography>
      )}
      {canExpand ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setIsExpanded((current) => !current)}
            sx={{
              ...supportingTextSx,
              px: 0,
              py: 0,
              minWidth: 0,
              color: "text.secondary",
              textAlign: "right",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            {isExpanded ? "閉じる" : "続きを読む"}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
