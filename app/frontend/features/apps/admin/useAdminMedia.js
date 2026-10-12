import { useCallback } from "react"
import useAdminList from "./useAdminList"

function mediaUrl(page, query, token) {
  const params = new URLSearchParams({ page: String(page) })
  if (query) params.set("q", query)
  if (token) params.set("token", token)
  return `/api/app/management/media?${params}`
}

const loadError = "メディアを取得できませんでした。時間をおいて再度お試しください。"

export default function useAdminMedia({ query, refreshKey, onUnauthorized }) {
  const urlForPage = useCallback((page, token) => mediaUrl(page, query, token), [query])
  return useAdminList({ urlForPage, itemsKey: "media", loadError, refreshKey, onUnauthorized, resetTotalCount: true })
}
