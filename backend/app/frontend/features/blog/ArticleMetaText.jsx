import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function ArticleMetaText({ articleStats, author, authorHref, date, mode = "list" }) {
  const AuthorComponent = (
    <Box
      component={authorHref ? Link : "span"}
      href={authorHref}
      data-testid={mode === "detail" ? "article-detail-author" : "article-meta-author"}
      sx={{
        color: "text.primary",
        fontWeight: 700,
        lineHeight: 1.35,
        textDecoration: "none",
        "&:hover": authorHref ? { textDecoration: "underline" } : undefined,
      }}
    >
      {author}
    </Box>
  )
  const secondaryParts = [date, articleStats].filter(Boolean)

  return (
    <Box
      data-testid={mode === "detail" ? "article-detail-meta" : "article-list-meta-text"}
      sx={{ minWidth: 0, display: "grid", gap: 0.25 }}
    >
      {AuthorComponent}
      {secondaryParts.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ m: 0, lineHeight: 1.45 }}>
          {secondaryParts.join(" ・ ")}
        </Typography>
      ) : null}
    </Box>
  )
}
