import useSWR from "swr"
import type { Article } from "../types/article"
import { API_BASE } from "../constants"

const fetcher = async (url: string): Promise<Article[]> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`APIリクエスト失敗: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as Article[]
}

export function useArticles() {
  return useSWR<Article[]>(`${API_BASE}/articles.json`, fetcher, {
    revalidateOnFocus: false,
  })
}
