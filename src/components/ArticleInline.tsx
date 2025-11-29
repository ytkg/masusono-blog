import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'
import type { Article } from '../types/article'

interface Props {
  article?: Article | null
  linkTo?: string
  linkState?: unknown
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  loading?: boolean
  error?: unknown
}

const headingVariantMap: Record<NonNullable<Props['headingLevel']>, 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1'> = {
  h1: 'h4',
  h2: 'h5',
  h3: 'h5',
  h4: 'h6',
  h5: 'subtitle1',
  h6: 'subtitle1',
}

const ArticleTitleLink = styled(RouterLink)<RouterLinkProps>(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  display: 'inline-block',
  '&:hover': { textDecoration: 'underline' },
  transition: theme.transitions.create('color'),
}))

export default function ArticleInline({ article, linkTo, linkState, headingLevel = 'h2', loading, error }: Props) {
  const isLoading = Boolean(loading)
  const html = (article?.content ?? article?.body ?? '') || ''
  const author = article?.author?.name ?? '不明'
  const date = formatDate(article?.publishedAt || article?.createdAt)
  const hasBody = Boolean(html.trim())
  const errorMessage =
    error instanceof Error ? error.message : error != null ? String(error) : null

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
      {isLoading && (
        <Box>
          <Skeleton variant="text" height={36} width="80%" />
          <Skeleton variant="rectangular" height={180} sx={{ mt: 2 }} />
        </Box>
      )}
      {!isLoading && errorMessage && (
        <Alert severity="error">{errorMessage}</Alert>
      )}
      {!isLoading && !errorMessage && article && (
        <>
          <Typography
            variant={headingVariantMap[headingLevel]}
            component={headingLevel}
            gutterBottom
            sx={{ fontSize: { xs: '1.3rem', sm: '1.35rem' }, fontWeight: 700 }}
          >
            {linkTo ? (
              <ArticleTitleLink to={linkTo} state={linkState}>
                {article.title}
              </ArticleTitleLink>
            ) : (
              article.title
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {`${date} ${author}`}
          </Typography>
          {hasBody ? (
            <Box
              sx={{
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                '& a': {
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                },
              }}
              /* biome-ignore lint/security/noDangerouslySetInnerHtml: 記事本文はサーバー側でサニタイズ済み */
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <Typography color="text.secondary">本文がありません。</Typography>
          )}
        </>
      )}
      {!isLoading && !errorMessage && !article && (
        <Typography color="text.secondary">記事が見つかりません。</Typography>
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
