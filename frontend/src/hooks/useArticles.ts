import useSWR from "swr"
import type { Article } from "../types/article"
import { API_BASE } from "../constants"

type ProxyArticle = {
  id: string
  publishedDate?: string
  title?: string
  content?: string
  author: string | null
}

const fetcher = async (url: string): Promise<Article[]> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`APIリクエスト失敗: ${res.status} ${res.statusText}`)
  }

  const body = (await res.json()) as ProxyArticle[]
  return body.map((article) => ({
    id: article.id,
    publishedDate: article.publishedDate,
    title: article.title ?? "",
    content: article.content,
    author: article.author ? { name: article.author } : undefined,
  }))
}

export function useArticles() {
  return useSWR<Article[]>(`${API_BASE}/articles.json`, fetcher, {
    revalidateOnFocus: false,
  })
}
