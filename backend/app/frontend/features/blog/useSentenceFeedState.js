import { useCallback, useLayoutEffect, useMemo, useRef } from "react"
import { router, useRemember } from "@inertiajs/react"
import { rememberInCurrentHistoryEntry } from "@/shared/lib/rememberedState"
import { prepareSentenceArticles, createInitialSentenceState } from "./sentenceFeedData"

const SENTENCE_STATE_KEY = "home-beginnings"

export default function useSentenceFeedState(articles) {
  const sourceRef = useRef([])
  const rememberedStateRef = useRef(null)
  const sentenceArticles = useMemo(() => prepareSentenceArticles(articles), [articles])
  const initialState = useMemo(() => createInitialSentenceState(sentenceArticles), [sentenceArticles])
  const [rememberedState, setRememberedState] = useRemember(initialState, SENTENCE_STATE_KEY)
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
  }, [rememberedState, rememberedState.nextCursor, rememberedState.sourceIds, sentenceArticlesById])

  return { items, sourceRef, rememberedStateRef, commitRememberedState }
}
