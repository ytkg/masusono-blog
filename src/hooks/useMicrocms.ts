import useSWR from 'swr'
import { apiFetchJson, type Article, type Author, type ListResponse } from '../services/microcms'

export function useArticles(limit = 20) {
  const key = `articles?limit=${limit}`
  const swr = useSWR<ListResponse<Article>>(key, apiFetchJson, {
    revalidateOnFocus: false,
  })
  return swr
}

export function useArticle(id?: string | null, fallback?: Article | null) {
  const key = id ? `articles/${id}` : null
  const swr = useSWR<Article>(key, apiFetchJson, {
    revalidateOnFocus: false,
    fallbackData: fallback ?? undefined,
  })
  return swr
}

export function useAuthors(limit = 50) {
  const key = `authors?limit=${limit}`
  const swr = useSWR<ListResponse<Author>>(key, apiFetchJson, {
    revalidateOnFocus: false,
  })
  return swr
}
