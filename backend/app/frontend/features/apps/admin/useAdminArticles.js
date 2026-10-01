import { useCallback } from "react"
import useAdminList from "./useAdminList"

function articlesUrl(page, query, status) {
  const params = new URLSearchParams({ page: String(page), status })
  if (query) params.set("q", query)
  return `/api/app/management/articles?${params}`
}

const loadError = "記事を取得できませんでした。時間をおいて再度お試しください。"

export default function useAdminArticles({ query, status, refreshKey, onUnauthorized }) {
  const urlForPage = useCallback((page) => articlesUrl(page, query, status), [query, status])
  return useAdminList({ urlForPage, itemsKey: "articles", loadError, refreshKey, onUnauthorized })
}
