import { useEffect, useRef, useState } from "react"
import { requestJson } from "../../../shared/lib/fetchJson"

export default function useAdminList({
  urlForPage,
  itemsKey,
  loadError,
  refreshKey,
  onUnauthorized,
  resetTotalCount = false,
}) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [nextToken, setNextToken] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)
  const controllerRef = useRef(null)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    controllerRef.current = controller
    loadingMoreRef.current = false
    setLoadingMore(false)
    setLoading(true)
    setError(null)
    setItems([])
    setHasMore(false)
    setNextToken(null)
    if (resetTotalCount) setTotalCount(0)
    requestJson(urlForPage(1), { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        setItems(result[itemsKey])
        setPage(result.page)
        setHasMore(result.has_more)
        setNextToken(result.next_token ?? null)
        setTotalCount(result.total_count)
      })
      .catch((failure) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (failure.status === 401) onUnauthorized()
        else setError(loadError)
      })
      .finally(() => {
        if (!controller.signal.aborted && requestId === requestIdRef.current) setLoading(false)
      })
    return () => {
      controller.abort()
      requestIdRef.current += 1
    }
  }, [urlForPage, itemsKey, loadError, refreshKey, onUnauthorized, resetTotalCount])

  async function loadMore() {
    const controller = controllerRef.current
    if (loading || loadingMoreRef.current || !hasMore || !controller || controller.signal.aborted) return
    const requestId = requestIdRef.current
    loadingMoreRef.current = true
    setLoadingMore(true)
    setError(null)
    try {
      const result = await requestJson(urlForPage(page + 1, nextToken), { signal: controller.signal })
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      setItems((current) => [...current, ...result[itemsKey]])
      setPage(result.page)
      setHasMore(result.has_more)
      setNextToken(result.next_token ?? null)
    } catch (failure) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      if (failure.status === 401) onUnauthorized()
      else setError(loadError)
    } finally {
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        loadingMoreRef.current = false
        setLoadingMore(false)
      }
    }
  }

  return { items, totalCount, hasMore, loading, loadingMore, error, loadMore }
}
