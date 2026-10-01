import { useEffect, useRef } from "react"
import { appendSentenceItems, markSentenceItemsRevealed, SENTENCE_REVEAL_SETTLE_MS } from "./sentenceFeedData"

const INFINITE_SCROLL_THRESHOLD = 2600

export default function useSentenceFeedProgress({ items, sourceRef, rememberedStateRef, commitRememberedState }) {
  const isAppendingRef = useRef(false)
  const frameRef = useRef(null)
  useEffect(() => {
    function appendWhenNearBottom() {
      const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      if (isAppendingRef.current || distanceToBottom > INFINITE_SCROLL_THRESHOLD || sourceRef.current.length === 0)
        return

      isAppendingRef.current = true
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        const next = appendSentenceItems(rememberedStateRef.current, sourceRef.current)
        sourceRef.current = next.source
        commitRememberedState(next.state)
        isAppendingRef.current = false
      })
    }

    window.addEventListener("scroll", appendWhenNearBottom, { passive: true })
    return () => {
      window.removeEventListener("scroll", appendWhenNearBottom)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      isAppendingRef.current = false
    }
  }, [commitRememberedState, sourceRef, rememberedStateRef])

  useEffect(() => {
    if (items.length === 0 || items.every((item) => item.hasRevealed)) return undefined

    const timer = window.setTimeout(() => {
      commitRememberedState(markSentenceItemsRevealed(rememberedStateRef.current))
    }, SENTENCE_REVEAL_SETTLE_MS)

    return () => window.clearTimeout(timer)
  }, [commitRememberedState, items, rememberedStateRef])
}
