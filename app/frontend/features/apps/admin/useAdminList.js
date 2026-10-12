import { useEffect, useReducer, useRef } from "react"
import { adminListReducer, initialAdminListState } from "./adminListReducer"
import { requestJson } from "../../../shared/lib/fetchJson"

export default function useAdminList({
  urlForPage,
  itemsKey,
  loadError,
  refreshKey,
  onUnauthorized,
  resetTotalCount = false,
}) {
  const [state, dispatch] = useReducer(adminListReducer, initialAdminListState)
  const { items, page, hasMore, nextToken, totalCount, loading, loadingMore, error } = state
  const requestIdRef = useRef(0)
  const controllerRef = useRef(null)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    controllerRef.current = controller
    loadingMoreRef.current = false
    dispatch({ type: "reset", resetTotalCount })
    requestJson(urlForPage(1), { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        dispatch({ type: "loaded", items: result[itemsKey], result })
      })
      .catch((failure) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return
        if (failure.status === 401) onUnauthorized()
        else dispatch({ type: "failed", message: loadError })
      })
      .finally(() => {
        if (!controller.signal.aborted && requestId === requestIdRef.current) dispatch({ type: "initialFinished" })
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
    dispatch({ type: "moreStarted" })
    try {
      const result = await requestJson(urlForPage(page + 1, nextToken), { signal: controller.signal })
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      dispatch({ type: "loaded", items: result[itemsKey], result, append: true })
    } catch (failure) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      if (failure.status === 401) onUnauthorized()
      else dispatch({ type: "failed", message: loadError })
    } finally {
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        loadingMoreRef.current = false
        dispatch({ type: "moreFinished" })
      }
    }
  }

  return { items, totalCount, hasMore, loading, loadingMore, error, loadMore }
}
