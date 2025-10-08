import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
// import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { fetchArticles, fetchAuthors, type Article, type Author } from '../services/microcms'
import { useLocation, useSearchParams } from 'react-router-dom'
import ArticleInline from './ArticleInline'

export default function ArticlesList() {
  const location = useLocation()
  const [, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<string>(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tab') ?? 'all'
  })
  const [authors, setAuthors] = useState<Author[]>([])
  const [authorsLoading, setAuthorsLoading] = useState(true)
  const [authorsError, setAuthorsError] = useState<string | null>(null)
  // 直接一覧に本文を表示するため、ルートや選択状態は不要
  const applyTab = (v: string) => {
    setTab(v)
    const params = new URLSearchParams(location.search)
    if (v === 'all') params.delete('tab')
    else params.set('tab', v)
    setSearchParams(params)
  }

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

  const counts = useMemo(() => {
    const byAuthor: Record<string, number> = {}
    for (const a of items) {
      const key = String(a.author?.id ?? '')
      byAuthor[key] = (byAuthor[key] ?? 0) + 1
    }
    return { all: items.length, byAuthor }
  }, [items])

  const filtered = useMemo(() => {
    if (tab === 'all') return items
    return items.filter((a) => String(a.author?.id ?? '') === tab)
  }, [items, tab])

  // URLのクエリ (?tab=...) 変更を監視してタブを同期
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('tab') ?? 'all'
    if (q !== tab) setTab(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  if (loading) {
    return (
      <>
        <Tabs value={tab} onChange={(_, v) => applyTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2 }}>
          <Tab label={`みんな (${counts.all})`} value="all" sx={{ px: 1, minWidth: 'auto' }} />
          {authors.map((au) => (
            <Tab
              key={au.id ?? au.name}
              label={`${au.name ?? '(無名)'} (${counts.byAuthor[String(au.id ?? '')] ?? 0})`}
              value={String(au.id ?? au.name)}
              sx={{ px: 1, minWidth: 'auto' }}
            />
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
      <Tabs
        value={tab}
        onChange={(_, v) => applyTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        <Tab label={`みんな (${counts.all})`} value="all" sx={{ px: 1, minWidth: 'auto' }} />
        {authors.map((au) => (
          <Tab
            key={au.id ?? au.name}
            label={`${au.name ?? '(無名)'} (${counts.byAuthor[String(au.id ?? '')] ?? 0})`}
            value={String(au.id ?? au.name)}
            sx={{ px: 1, minWidth: 'auto' }}
          />
        ))}
      </Tabs>
      {/* 一覧ページに本文をそのまま表示するため、個別選択の挿入は不要 */}
      {!authorsLoading && authorsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          著者の取得に失敗しました: {authorsError}
        </Alert>
      )}
      {filtered.length === 0 ? (
        <Typography color="text.secondary">該当する記事がありません。</Typography>
      ) : (
        <>
          {filtered.map((a) => (
            <ArticleInline key={a.id} id={a.id} article={a} />
          ))}
        </>
      )}

    </>
  )
}

// 日付表示は ArticleInline 側で対応
