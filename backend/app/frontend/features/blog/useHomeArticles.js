import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { router } from "@inertiajs/react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import { requestJson } from "@/shared/lib/fetchJson"

export default function useHomeArticles(articles, pagination) {
  const { state, stateRef, commit } = useImmediateRemember(
    { articles, nextOffset: pagination?.nextOffset ?? null },
    "home-articles",
  )
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const requestRef = useRef(null)

  useEffect(() => () => requestRef.current?.abort(), [])

  useEffect(
    () =>
      router.on("before", ({ detail: { visit } }) => {
        if (!visit.prefetch && !visit.async) commit({ ...stateRef.current, scrollY: window.scrollY })
      }),
    [commit, stateRef],
  )

  useLayoutEffect(() => {
    if (!state.scrollY) return
    // Let the remembered list mount and Inertia's own animation-frame restore finish first.
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => window.scrollTo({ top: state.scrollY }))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [state.scrollY])

  const loadMore = useCallback(async () => {
    const offset = stateRef.current.nextOffset
    if (offset === null || requestRef.current) return

    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setFailed(false)
    try {
      const result = await requestJson(`/api/app/articles?offset=${offset}`, { signal: controller.signal })
      if (controller.signal.aborted) return
      const nextOffset = result.pagination?.nextOffset
      if (
        !Array.isArray(result.articles) ||
        (nextOffset !== null && (!Number.isInteger(nextOffset) || nextOffset <= offset))
      ) {
        throw new Error("Invalid articles page")
      }
      const currentArticles = stateRef.current.articles
      const existingIds = new Set(currentArticles.map((article) => article.id))
      const newArticles = result.articles.filter((article) => {
        if (existingIds.has(article.id)) return false
        existingIds.add(article.id)
        return true
      })
      commit({ articles: [...currentArticles, ...newArticles], nextOffset })
    } catch {
      if (!controller.signal.aborted) setFailed(true)
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = null
        setLoading(false)
      }
    }
  }, [commit, stateRef])

  return { articles: state.articles, hasMore: state.nextOffset !== null, loading, failed, loadMore }
}
