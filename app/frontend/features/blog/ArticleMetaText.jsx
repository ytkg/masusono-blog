import { focusVisibleSx } from "../../shared/styles/focusStyles"
import { Link } from "@inertiajs/react"
import { Fragment } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function ArticleMetaText({ articleStats, author, authorHref, date, mode = "list" }) {
  const secondaryParts = [date, articleStats].filter(Boolean)

  return (
    <Box
      data-testid={mode === "detail" ? "article-detail-meta" : "article-list-meta-text"}
      sx={{ minWidth: 0, display: "grid", gap: 0.25 }}
    >
      <Box
        component={authorHref ? Link : "span"}
        href={authorHref}
        data-testid={mode === "detail" ? "article-detail-author" : "article-meta-author"}
        sx={{
          ...(authorHref ? focusVisibleSx : {}),
          color: "text.primary",
          fontWeight: 700,
          lineHeight: 1.35,
          overflowWrap: "anywhere",
          textDecoration: "none",
          "&:hover": authorHref ? { textDecoration: "underline" } : undefined,
        }}
      >
        {author}
      </Box>
      {secondaryParts.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ m: 0, lineHeight: 1.45 }}>
          {secondaryParts.map((part, index) => (
            <Fragment key={part}>
              {index > 0 ? " ・ " : null}
              <Box component="span" sx={{ display: "inline-block", maxWidth: "100%" }}>
                {part}
              </Box>
            </Fragment>
          ))}
        </Typography>
      ) : null}
    </Box>
  )
}
