import Typography from '@mui/material/Typography'
import ArticlesList from './ArticlesList'
import PageContainer from './PageContainer'

export default function Blog() {
  return (
    <PageContainer id="blog">
      <Typography variant="h5" component="h2" gutterBottom>
        ブログ
      </Typography>
      <ArticlesList />
    </PageContainer>
  )
}
