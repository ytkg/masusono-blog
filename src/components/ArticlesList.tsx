import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
// import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { fetchArticles, fetchAuthors, type Article, type Author } from '../services/microcms'
import ArticleModal from './ArticleModal'

export default function ArticlesList() {
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<string>('all')
  const [authors, setAuthors] = useState<Author[]>([])
  const [authorsLoading, setAuthorsLoading] = useState(true)
  const [authorsError, setAuthorsError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetchArticles(20)
      .then((res) => {
        if (!active) return
        setItems(res.contents)
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
  }, [])

  useEffect(() => {
    let active = true
    setAuthorsLoading(true)
    setAuthorsError(null)
    fetchAuthors(50)
      .then((res) => {
        if (!active) return
        setAuthors(res.contents)
      })
      .catch((e: unknown) => {
        if (!active) return
        setAuthorsError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!active) return
        setAuthorsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (tab === 'all') return items
    return items.filter((a) => String(a.author?.id ?? '') === tab)
  }, [items, tab])

  if (loading) {
    return (
      <>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2 }}>
          <Tab label="みんな" value="all" />
          {authors.map((au) => (
            <Tab key={au.id ?? au.name} label={au.name ?? '(無名)'} value={String(au.id ?? au.name)} />
          ))}
        </Tabs>
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
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2 }}>
        <Tab label="みんな" value="all" />
        {authors.map((au) => (
          <Tab key={au.id ?? au.name} label={au.name ?? '(無名)'} value={String(au.id ?? au.name)} />
        ))}
      </Tabs>
      {!authorsLoading && authorsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          著者の取得に失敗しました: {authorsError}
        </Alert>
      )}
      {filtered.length === 0 ? (
        <Typography color="text.secondary">該当する記事がありません。</Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((a) => (
            <Grid key={a.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardActionArea onClick={() => setOpenId(a.id)}>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {a.title}
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`${formatDate(a.publishedAt || a.createdAt)} ${a.author?.name ?? '不明'}`}
                  </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ArticleModal open={!!openId} id={openId} onClose={() => setOpenId(null)} />
    </>
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
    return input
  }
}
