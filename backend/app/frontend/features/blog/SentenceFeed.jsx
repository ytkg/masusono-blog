import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { router, useRemember } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { rememberInCurrentHistoryEntry } from "@/shared/lib/rememberedState"
import SentenceFeedCard from "./SentenceFeedCard"
import {
  appendSentenceItems,
  createInitialSentenceState,
  markSentenceItemsRevealed,
  prepareSentenceArticles,
  SENTENCE_REVEAL_SETTLE_MS,
} from "./sentenceFeedData"
import { sentenceFeedLayout } from "./sentenceFeedLayout"

const INFINITE_SCROLL_THRESHOLD = 2600
const SENTENCE_STATE_KEY = "home-beginnings"

export default function SentenceFeed({ articles = [] }) {
  const sourceRef = useRef([])
  const cursorRef = useRef(0)
  const isAppendingRef = useRef(false)
  const rememberedStateRef = useRef(null)
  const containerRef = useRef(null)
  const sentenceArticles = useMemo(() => prepareSentenceArticles(articles), [articles])
  const initialState = useMemo(() => createInitialSentenceState(sentenceArticles), [sentenceArticles])
  const [rememberedState, setRememberedState] = useRemember(initialState, SENTENCE_STATE_KEY)
  const [height, setHeight] = useState(0)
  const articlesById = useMemo(() => new Map(articles.map((article) => [article.id, article])), [articles])
  const sentenceArticlesById = useMemo(
    () => new Map(sentenceArticles.map((article) => [article.id, article])),
    [sentenceArticles],
  )
  const items = useMemo(
    () =>
      rememberedState.items
        .map((item) => ({ ...item, article: articlesById.get(item.articleId) }))
        .filter((item) => item.article),
    [articlesById, rememberedState.items],
  )

  const commitRememberedState = useCallback(
    (nextState) => {
      rememberedStateRef.current = nextState
      rememberInCurrentHistoryEntry(SENTENCE_STATE_KEY, nextState)
      router.remember(nextState, SENTENCE_STATE_KEY)
      setRememberedState(nextState)
    },
    [setRememberedState],
  )

  useLayoutEffect(() => {
    rememberedStateRef.current = rememberedState
    sourceRef.current = rememberedState.sourceIds.map((id) => sentenceArticlesById.get(id)).filter(Boolean)
    cursorRef.current = rememberedState.nextCursor
  }, [rememberedState, rememberedState.nextCursor, rememberedState.sourceIds, sentenceArticlesById])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return undefined

    function layout() {
      const cardElements = Array.from(container.querySelectorAll(".sentence-card"))
      const nextLayout = sentenceFeedLayout({
        containerWidth: container.clientWidth,
        itemHeights: cardElements.map((card) => card.offsetHeight),
        viewportWidth: window.innerWidth,
      })

      cardElements.forEach((card, index) => {
        const { left, top, width } = nextLayout.items[index]
        card.style.width = `${width}px`
        card.style.transform = `translate(${left}px, ${top}px)`
      })
      setHeight(nextLayout.height)
    }

    layout()
    const observer = new ResizeObserver(layout)
    observer.observe(container)
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    function appendWhenNearBottom() {
      const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      if (isAppendingRef.current || distanceToBottom > INFINITE_SCROLL_THRESHOLD || sourceRef.current.length === 0)
        return

      isAppendingRef.current = true
      window.requestAnimationFrame(() => {
        const next = appendSentenceItems(rememberedStateRef.current, sourceRef.current)
        sourceRef.current = next.source
        cursorRef.current = next.state.nextCursor
        commitRememberedState(next.state)
        isAppendingRef.current = false
      })
    }

    window.addEventListener("scroll", appendWhenNearBottom, { passive: true })
    return () => window.removeEventListener("scroll", appendWhenNearBottom)
  }, [commitRememberedState])

  useEffect(() => {
    if (items.length === 0 || items.every((item) => item.hasRevealed)) return undefined

    const timer = window.setTimeout(() => {
      commitRememberedState(markSentenceItemsRevealed(rememberedStateRef.current))
    }, SENTENCE_REVEAL_SETTLE_MS)

    return () => window.clearTimeout(timer)
  }, [commitRememberedState, items])

  if (items.length === 0) {
    return <Typography color="text.secondary">書き出しを表示できる記事がありません。</Typography>
  }

  return (
    <Box
      ref={containerRef}
      data-testid="sentence-feed"
      sx={{ position: "relative", minHeight: height, overflowX: "clip", px: { xs: 0, sm: 1.5 } }}
    >
      {items.map(({ article, hasRevealed, key, sentence, revealDelay }) => (
        <SentenceFeedCard
          article={article}
          hasRevealed={hasRevealed}
          key={key}
          revealDelay={revealDelay}
          sentence={sentence}
        />
      ))}
    </Box>
  )
}
