import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ArticlesList from './ArticlesList'

export default function Blog() {
  return (
    <Box component="section" sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        ブログ
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: 'background.paper',
        }}
      >
        <ArticlesList />
      </Box>
    </Box>
  )
}
