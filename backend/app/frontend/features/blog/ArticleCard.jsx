import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ContentItemCard from "../../shared/ContentItemCard"

export default function ArticleCard({ article, mode = "list" }) {
  if (!article) {
    return (
      <ContentItemCard title="記事" titleComponent="h3">
        <Typography color="text.secondary">記事が見つかりません。</Typography>
      </ContentItemCard>
    )
  }

  const html = article.content ?? ""
  const author = article.author ?? "不明"
  const date = article.publishedDate ?? ""
  const hasBody = Boolean(html.trim())

  return (
    <ContentItemCard
      title={article.title}
      titleVariant="h6"
      titleComponent={mode === "detail" ? "h1" : "h3"}
      titleTo={mode === "list" ? `/blog/${article.id}` : undefined}
      metaParts={[date, author]}
    >
      {hasBody ? (
        <Box
          sx={{
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
        <Typography color="text.secondary">本文がありません。</Typography>
      )}
    </ContentItemCard>
  )
}
