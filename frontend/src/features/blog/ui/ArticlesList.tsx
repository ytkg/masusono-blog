import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Alert from "@mui/material/Alert"
import { useArticles } from "@/features/blog/hooks/useArticles"
import ArticleCard from "./ArticleCard"
import ContentCardSkeletonList from "@/shared/ui/ContentCardSkeletonList"

export default function ArticlesList() {
  const { data: articles, isLoading, error } = useArticles()

  if (isLoading && !articles) {
    return <ContentCardSkeletonList count={6} itemProps={{ subtitleWidth: "32%", mediaHeight: 160 }} />
  }

  if (error && !articles) {
    return <Alert severity="error">記事の取得に失敗しました: {String((error as Error)?.message ?? error)}</Alert>
  }

  if (!articles?.length) {
    return <Typography color="text.secondary">記事がありません。</Typography>
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Box>
  )
}
