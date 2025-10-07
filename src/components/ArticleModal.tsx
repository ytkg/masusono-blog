import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import { fetchArticle, type Article } from '../services/microcms'

interface Props {
  open: boolean
  id: string | null
  onClose: () => void
}

export default function ArticleModal({ open, id, onClose }: Props) {
  const [data, setData] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!open || !id) {
      setData(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    fetchArticle(id)
      .then((res) => {
        if (!active) return
        setData(res)
      })
      .catch((e: unknown) => {
        if (!active) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, id])

  const html = (data?.content ?? data?.body ?? '') as string
  const author = data?.author?.name ?? '不明'
  const date = formatDate(data?.publishedAt || data?.createdAt)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        {data?.title || '記事を読み込み中'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box>
            <Skeleton variant="text" height={36} width="80%" />
            <Skeleton variant="rectangular" height={180} sx={{ mt: 2 }} />
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && data && (
          <Box sx={{
            '& img': { maxWidth: '100%', height: 'auto' },
            '& p': { margin: '0 0 1em' },
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {`${date} ${author}`}
            </Typography>
            {html ? (
              <Box dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <Typography color="text.secondary">本文がありません。</Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
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
