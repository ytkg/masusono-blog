import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Link, router, useRemember } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { rememberInCurrentHistoryEntry } from "@/shared/lib/rememberedState"
import {
  appendSentenceItems,
  createInitialSentenceState,
  markSentenceItemsRevealed,
  prepareSentenceArticles,
  SENTENCE_REVEAL_DURATION_MS,
  SENTENCE_REVEAL_SETTLE_MS,
} from "./sentenceFeedData"

const INFINITE_SCROLL_THRESHOLD = 2600
const SENTENCE_STATE_KEY = "home-beginnings"

function fontSizeFor(length) {
  if (length <= 5) return "1.82rem"
  if (length <= 12) return "1.56rem"
  if (length <= 20) return "1.34rem"
  if (length <= 32) return "1.12rem"
  if (length <= 50) return "0.98rem"

  return "0.88rem"
}

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
      const isNarrow = window.matchMedia("(max-width: 720px)").matches
      const preferredColumnWidth = isNarrow ? 58 : 72
      const gap = isNarrow ? 12 : Math.min(22, Math.max(12, window.innerWidth * 0.018))
      const columnCount = Math.max(1, Math.floor((container.clientWidth + gap) / (preferredColumnWidth + gap)))
      const columnWidth = (container.clientWidth - gap * (columnCount - 1)) / columnCount
      const columnHeights = Array.from({ length: columnCount }, () => 0)

      Array.from(container.querySelectorAll(".sentence-card")).forEach((item) => {
        const columnIndex = columnHeights.indexOf(Math.min(...columnHeights))
        item.style.width = `${columnWidth}px`
        item.style.transform = `translate(${columnIndex * (columnWidth + gap)}px, ${columnHeights[columnIndex]}px)`
        columnHeights[columnIndex] += item.offsetHeight + gap
      })

      setHeight(Math.max(...columnHeights) - gap)
    }

    layout()
    const observer = new ResizeObserver(layout)
    observer.observe(container)
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    function appendWhenNearBottom() {
      const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      if (isAppendingRef.current || distanceToBottom > INFINITE_SCROLL_THRESHOLD || sourceRef.current.length === 0) return

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
        <Box
          component={Link}
          className="sentence-card"
          href={`/articles/${article.id}`}
          key={key}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0,
            p: { xs: "0.32rem 0.22rem", sm: "0.38rem 0.28rem" },
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            textDecoration: "none",
            WebkitTapHighlightColor: "transparent",
            transition: "background-color 120ms ease, border-color 120ms ease",
            opacity: hasRevealed ? 1 : 0,
            filter: hasRevealed ? "none" : "blur(5px)",
            animation: hasRevealed ? "none" : `sentence-reveal ${SENTENCE_REVEAL_DURATION_MS}ms ease forwards`,
            animationDelay: `${revealDelay}ms`,
            "@media (hover: hover)": {
              "&:hover": { borderColor: "text.primary", bgcolor: "background.default" },
            },
            "&:focus-visible": {
              borderColor: "text.primary",
              bgcolor: "background.default",
              outline: "2px solid",
              outlineColor: "secondary.main",
              outlineOffset: 3,
            },
            "&:active": { borderColor: "text.primary", bgcolor: "#f5f5f5" },
            "@keyframes sentence-reveal": { to: { opacity: 1, filter: "blur(0)" } },
            "@media (prefers-reduced-motion: reduce)": { animation: "none", filter: "none", opacity: 1 },
          }}
        >
          <Box
            component="span"
            sx={{
              writingMode: "vertical-rl",
              textOrientation: "upright",
              fontFamily: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Noto Serif JP", serif',
              fontSize: fontSizeFor(sentence.length),
              lineHeight: { xs: 1.75, sm: 1.95 },
              letterSpacing: "0.07em",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {sentence}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
