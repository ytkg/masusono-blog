import { useCallback, useEffect, useRef, useState } from "react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import { appendArticlePage, fetchArticlePage } from "./articlePages"
import useHomeScrollRestoration from "./useHomeScrollRestoration"

export default function useHomeArticles(articles, pagination) {
  const { state, stateRef, commit } = useImmediateRemember(
    { articles, nextOffset: pagination?.nextOffset ?? null },
    "home-articles",
  )
  const [status, setStatus] = useState("idle")
  const requestRef = useRef(null)

  useEffect(() => () => requestRef.current?.abort(), [])
  useHomeScrollRestoration({ scrollY: state.scrollY, stateRef, commit })

  const loadMore = useCallback(async () => {
    const offset = stateRef.current.nextOffset
    if (offset === null || requestRef.current) return

    const controller = new AbortController()
    requestRef.current = controller
    setStatus("loading")
    try {
      const page = await fetchArticlePage(offset, { signal: controller.signal })
      if (controller.signal.aborted) return
      commit(appendArticlePage(stateRef.current, page))
      setStatus("idle")
    } catch {
      if (!controller.signal.aborted) setStatus("failed")
    } finally {
      if (!controller.signal.aborted) requestRef.current = null
    }
  }, [commit, stateRef])

  return {
    articles: state.articles,
    hasMore: state.nextOffset !== null,
    loading: status === "loading",
    failed: status === "failed",
    loadMore,
  }
}
