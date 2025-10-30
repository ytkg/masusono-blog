import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import type { Article } from '../types/article'
import { useArticles } from '../hooks/useArticles'
import ArticleInline from './ArticleInline'

export default function ArticlesList() {
  const { data: articlesRes, isLoading: loading, error } = useArticles()
  const items: Article[] = articlesRes ?? []

  if (loading) {
    return (
      <>
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        記事の取得に失敗しました: {error}
      </Alert>
    )
  }

  if (!items.length) {
    return <Typography color="text.secondary">記事がありません。</Typography>
  }

  return (
    <>
      {items.map((a) => (
        <ArticleInline key={a.id} id={a.id} article={a} linkTo={`/blog/${a.id}`} linkState={{ article: a }} headingLevel="h3" />
      ))}
    </>
  )
}
