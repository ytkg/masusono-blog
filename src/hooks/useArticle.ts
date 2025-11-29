import { useMemo } from "react"
import { useArticles } from "./useArticles"
import type { Article } from "../types/article"

export function useArticle(id?: string | null, fallback?: Article | null) {
  const swr = useArticles()
  const { data: articles, error, isLoading, isValidating, mutate } = swr

  const article = useMemo(() => {
    if (!id) return fallback ?? null
    const found = articles?.find((item) => item.id === id)
    return found ?? fallback ?? null
  }, [articles, id, fallback])

  const resolvedError = useMemo(() => {
    if (error) return error
    if (id && articles && !article) {
      return new Error("記事が見つかりません。")
    }
    return undefined
  }, [error, id, articles, article])

  const resolvedLoading = id ? isLoading || (!articles && !article) : false

  return {
    data: article ?? undefined,
    error: resolvedError,
    isLoading: resolvedLoading,
    isValidating,
    mutate,
  }
}
