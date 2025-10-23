import { Navigate, useLocation, useParams, Link as RouterLink } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import ArticleInline from '../components/ArticleInline'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Article } from '../services/microcms'

type LocationState = {
  article?: Article
}

export default function ArticleDetail() {
  const { articleId } = useParams<{ articleId: string }>()
  const location = useLocation()
  const state = location.state as LocationState | undefined

  if (!articleId) {
    return <Navigate to="/blog" replace />
  }

  return (
    <PageContainer component="article">
      <Typography variant="h5" component="h2" gutterBottom>
        ブログ
      </Typography>
      <ArticleInline id={articleId} article={state?.article} />
      <Link
        component={RouterLink}
        to="/blog"
        color="inherit"
        underline="hover"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 3 }}
      >
        <ArrowBackIcon fontSize="small" />
        記事一覧に戻る
      </Link>
    </PageContainer>
  )
}
