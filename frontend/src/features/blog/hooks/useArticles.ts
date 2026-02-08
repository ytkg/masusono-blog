import useSWR from "swr"
import type { Article } from "@/features/blog/model/article"
import { API_BASE } from "@/constants"
import { fetchJson } from "@/shared/api/fetchJson"

export function useArticles() {
  return useSWR<Article[]>(`${API_BASE}/articles.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
