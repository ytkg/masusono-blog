import Box from "@mui/material/Box"
import ArticleAuthorAvatar from "./ArticleAuthorAvatar"
import ArticleMetaText from "./ArticleMetaText"

export default function ArticlePlainHeader({ action, articleStats, author, authorHref, avatarSrc, date, mode }) {
  const metaText = (
    <ArticleMetaText articleStats={articleStats} author={author} authorHref={authorHref} date={date} mode={mode} />
  )

  if (mode === "detail") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <ArticleAuthorAvatar author={author} authorHref={authorHref} avatarSrc={avatarSrc} sx={{ flex: "0 0 auto" }} />
        <Box
          data-testid="article-detail-header"
          sx={{
            minWidth: 0,
            flex: "1 1 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>{metaText}</Box>
          <Box sx={{ flex: "0 0 auto" }}>{action}</Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <ArticleAuthorAvatar author={author} authorHref={authorHref} avatarSrc={avatarSrc} sx={{ flex: "0 0 auto" }} />
      <Box
        data-testid="article-list-meta"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, width: "100%" }}
      >
        {metaText}
        <Box sx={{ flex: "0 0 auto", ml: 1 }}>{action}</Box>
      </Box>
    </Box>
  )
}
