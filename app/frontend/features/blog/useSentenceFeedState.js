import { useLayoutEffect, useMemo, useRef } from "react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import { prepareSentenceArticles, createInitialSentenceState, mergeSentenceArticleSources } from "./sentenceFeedData"

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
  const articlesById = useMemo(() => indexArticlesById(articles), [articles])
  const sentenceArticlesById = useMemo(() => indexArticlesById(sentenceArticles), [sentenceArticles])
  const items = useMemo(
    () =>
      rememberedState.items
        .map((item) => ({ ...item, article: articlesById.get(item.articleId) }))
        .filter((item) => item.article),
    [articlesById, rememberedState.items],
  )

  useLayoutEffect(() => {
    const state = rememberedStateRef.current
    const nextState = mergeSentenceArticleSources(state, sentenceArticles)
    if (nextState !== state) commitRememberedState(nextState)
  }, [sentenceArticles, rememberedStateRef, commitRememberedState])

  useLayoutEffect(() => {
    sourceRef.current = rememberedState.sourceIds.map((id) => sentenceArticlesById.get(id)).filter(Boolean)
  }, [rememberedState.sourceIds, sentenceArticlesById])

  return { items, sourceRef, rememberedStateRef, commitRememberedState }
}

function indexArticlesById(articles) {
  return new Map(articles.map((article) => [article.id, article]))
}
