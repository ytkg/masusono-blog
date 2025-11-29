import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import { useArticles } from "../hooks/useArticles"
import ArticleInline from "./ArticleInline"

const SKELETON_COUNT = 6
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `skeleton-${index}`)

export default function ArticlesList() {
  const { data: articles, isLoading, error } = useArticles()

  if (isLoading && !articles) {
    return (
      <Grid container spacing={2}>
        {SKELETON_KEYS.map((key) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (error && !articles) {
    return <Alert severity="error">記事の取得に失敗しました: {String((error as Error)?.message ?? error)}</Alert>
  }

  if (!articles?.length) {
    return <Typography color="text.secondary">記事がありません。</Typography>
  }

  return (
    <>
      {articles.map((article) => (
        <ArticleInline
          key={article.id}
          article={article}
          linkTo={`/blog/${article.id}`}
          linkState={{ article }}
          headingLevel="h3"
        />
      ))}
    </>
  )
}
