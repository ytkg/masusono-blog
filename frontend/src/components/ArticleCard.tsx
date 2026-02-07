import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import type { Article } from "../types/article"
import ContentCard from "./ContentCard"
import ContentItemCard from "./ContentItemCard"

interface ArticleCardProps {
  article?: Article | null
  mode?: "list" | "detail"
  loading?: boolean
  error?: unknown
}

export default function ArticleCard({
  article,
  mode = "list",
  loading,
  error,
}: ArticleCardProps) {
  const isLoading = Boolean(loading)
  const html = article?.content ?? ""
  const author = article?.author ?? "不明"
  const date = article?.publishedDate ?? ""
  const hasBody = Boolean(html.trim())
  const errorMessage = error instanceof Error ? error.message : error != null ? String(error) : null
  const headingLevel = mode === "detail" ? "h1" : "h3"
  const titleVariant = "h5"
  const linkTo = mode === "list" && article ? `/blog/${article.id}` : undefined
  const linkState = mode === "list" && article ? { article } : undefined

  if (isLoading) {
    return (
      <ContentCard>
        <Box>
          <Skeleton variant="text" height={36} width="80%" />
          <Skeleton variant="rectangular" height={180} sx={{ mt: 2 }} />
        </Box>
      </ContentCard>
    )
  }

  if (errorMessage) {
    return (
      <ContentCard>
        <Alert severity="error">{errorMessage}</Alert>
      </ContentCard>
    )
  }

  if (!article) {
    return (
      <ContentCard>
        <Typography color="text.secondary">記事が見つかりません。</Typography>
      </ContentCard>
    )
  }

  return (
    <ContentItemCard
      title={article.title}
      titleVariant={titleVariant}
      titleComponent={headingLevel}
      titleTo={linkTo}
      titleState={linkState}
      meta={`${date} ${author}`}
    >
      {hasBody ? (
        <Box
          sx={{
            "& img": { maxWidth: "100%", height: "auto" },
            "& p": { margin: "0 0 1em" },
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            "& a": {
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            },
          }}
          /* biome-ignore lint/security/noDangerouslySetInnerHtml: 記事本文はサーバー側でサニタイズ済み */
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <Typography color="text.secondary">本文がありません。</Typography>
      )}
    </ContentItemCard>
  )
}
