import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import { Link as RouterLink } from 'react-router-dom'
import type { Article } from '../services/microcms'
import { useArticle } from '../hooks/useMicrocms'

interface Props {
  id: string
  article?: Article | null
  linkTo?: string
  linkState?: unknown
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const headingVariantMap: Record<NonNullable<Props['headingLevel']>, 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1'> = {
  h1: 'h4',
  h2: 'h5',
  h3: 'h5',
  h4: 'h6',
  h5: 'subtitle1',
  h6: 'subtitle1',
}

export default function ArticleInline({ id, article, linkTo, linkState, headingLevel = 'h2' }: Props) {
  const fallback = useMemo(() => (article && (article.content || article.body) ? article : null), [article])
  const { data, isLoading: loading, error } = useArticle(id, fallback)

  const html = ((data?.content ?? data?.body ?? '') as unknown) as string
  const author = data?.author?.name ?? '不明'
  const date = formatDate(data?.publishedAt || data?.createdAt)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: { xs: 2, sm: 3 },
        mb: 2,
        '&:last-of-type': { mb: 0 },
        '& img': { maxWidth: '100%', height: 'auto' },
        '& p': { margin: '0 0 1em' },
        backgroundColor: 'background.paper',
      }}
    >
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
            variant={headingVariantMap[headingLevel]}
            component={headingLevel}
            gutterBottom
            sx={{ fontSize: { xs: '1.3rem', sm: '1.35rem' }, fontWeight: 700 }}
          >
            {linkTo ? (
              <Box
                component={RouterLink}
                to={linkTo}
                state={linkState}
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-block',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {data.title}
              </Box>
            ) : (
              data.title
            )}
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
