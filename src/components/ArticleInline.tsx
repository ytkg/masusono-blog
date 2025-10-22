import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import { type Article } from '../services/microcms'
import { useArticle } from '../hooks/useMicrocms'

interface Props {
  id: string
  article?: Article | null
}

export default function ArticleInline({ id, article }: Props) {
  const fallback = useMemo(() => (article && (article.content || article.body) ? article : null), [article])
  const { data, isLoading: loading, error } = useArticle(id, fallback)

  const html = ((data?.content ?? data?.body ?? '') as unknown) as string
  const author = data?.author?.name ?? '不明'
  const date = formatDate(data?.publishedAt || data?.createdAt)

  return (
    <Box sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: { xs: 2, sm: 3 },
      mb: 2,
      '& img': { maxWidth: '100%', height: 'auto' },
      '& p': { margin: '0 0 1em' },
      backgroundColor: 'background.paper',
    }}>
      {loading && (
        <Box>
          <Skeleton variant="text" height={36} width="80%" />
          <Skeleton variant="rectangular" height={180} sx={{ mt: 2 }} />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{String((error as Error)?.message ?? error)}</Alert>}
      {!loading && !error && data && (
        <>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontSize: { xs: '1.3rem', sm: '1.35rem' }, fontWeight: 700 }}
          >
            {data.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {`${date} ${author}`}
          </Typography>
          {html ? (
            <Box
              sx={{
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                '& a': {
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                },
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <Typography color="text.secondary">本文がありません。</Typography>
          )}
        </>
      )}
    </Box>
  )
}

function formatDate(input?: string) {
  if (!input) return ''
  try {
    const d = new Date(input)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  } catch {
    return input ?? ''
  }
}
