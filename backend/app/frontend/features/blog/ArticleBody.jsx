import { supportingActionSx } from "../../shared/supportingActionStyles"
import { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { articleBodyTextSx } from "./articleBodyHtmlSx"
import { buildArticleExcerpt } from "./articleExcerpt"
import ArticleHtml from "./ArticleHtml"

export default function ArticleBody({ enableRubyRunner = false, html, hasBody, shouldCollapse }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!hasBody) {
    return <Typography color="text.secondary">本文がありません。</Typography>
  }

  const { excerpt, canExpand } = shouldCollapse ? buildArticleExcerpt(html, true) : { canExpand: false }
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
