import { useLayoutEffect, useMemo, useRef } from "react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import { prepareSentenceArticles, createInitialSentenceState } from "./sentenceFeedData"

const SENTENCE_STATE_KEY = "home-beginnings"

export default function useSentenceFeedState(articles) {
  const sourceRef = useRef([])
  const sentenceArticles = useMemo(() => prepareSentenceArticles(articles), [articles])
  const initialState = useMemo(() => createInitialSentenceState(sentenceArticles), [sentenceArticles])
  const {
    state: rememberedState,
    stateRef: rememberedStateRef,
    commit: commitRememberedState,
  } = useImmediateRemember(initialState, SENTENCE_STATE_KEY)
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

  useLayoutEffect(() => {
    sourceRef.current = rememberedState.sourceIds.map((id) => sentenceArticlesById.get(id)).filter(Boolean)
  }, [rememberedState.sourceIds, sentenceArticlesById])

  return { items, sourceRef, rememberedStateRef, commitRememberedState }
}
