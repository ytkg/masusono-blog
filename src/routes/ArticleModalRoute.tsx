import { useMemo } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import ArticleModal from '../components/ArticleModal'
import type { Article } from '../services/microcms'

export default function ArticleModalRoute() {
  const location = useLocation()
  const navigate = useNavigate()

  const match = useMemo(() => {
    return matchPath({ path: '/articles/:id' }, location.pathname)
  }, [location.pathname])

  const id = match?.params?.id ?? null
  const state = location.state as { article?: Article } | null
  const article = state?.article ?? null

  if (!id) return null

  return (
    <ArticleModal
      open={true}
      id={id}
      article={article}
      onClose={() =>
        navigate({ pathname: '/', search: location.search }, { replace: true })
      }
    />
  )
}
