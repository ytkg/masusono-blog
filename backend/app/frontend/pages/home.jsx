import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { router, useRemember } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import { consumeHomeFeedIntent } from "@/shared/lib/homeNavigation"
import { rememberInCurrentHistoryEntry } from "@/shared/lib/rememberedState"
import { DEFAULT_HOME_TAB_ID, HOME_TABS, isHomeTabId } from "../features/blog/HomeTabs"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

const SWIPE_MIN_DISTANCE = 35
const SWIPE_AXIS_RATIO = 1.25
const HOME_TAB_HEIGHT = 38
const HOME_STATE_KEY = "home-state"
const HOME_STATE_VERSION = 1

const compactTabSx = {
  minHeight: HOME_TAB_HEIGHT,
  py: 0.75,
}

function pickRandomArticleIds(articles, count) {
  return [...articles]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((article) => article.id)
}

function getSwipeMode(mode, start, end) {
  if (!start) return null

  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (absX < SWIPE_MIN_DISTANCE || absX < absY * SWIPE_AXIS_RATIO) return null

  const currentIndex = HOME_TABS.findIndex((tab) => tab.id === mode)
  const nextIndex = currentIndex + (deltaX < 0 ? 1 : -1)

  return HOME_TABS[nextIndex]?.id ?? null
}

function normalizeHomeState(state, fallbackState) {
  return {
    ...fallbackState,
    ...state,
    mode: isHomeTabId(state?.mode) ? state.mode : DEFAULT_HOME_TAB_ID,
    recommendedArticleIds: Array.isArray(state?.recommendedArticleIds)
      ? state.recommendedArticleIds
      : fallbackState.recommendedArticleIds,
    version: HOME_STATE_VERSION,
  }
}

export default function Home({ articles = [] }) {
  const initialRecommendedArticleIds = useMemo(() => pickRandomArticleIds(articles, 5), [articles])
  const initialHomeState = useMemo(
    () => ({
      mode: DEFAULT_HOME_TAB_ID,
      recommendedArticleIds: initialRecommendedArticleIds,
      version: HOME_STATE_VERSION,
    }),
    [initialRecommendedArticleIds],
  )
  const [shouldStartOnFeed, setShouldStartOnFeed] = useState(consumeHomeFeedIntent)
  const [homeState, setHomeState] = useRemember(initialHomeState, HOME_STATE_KEY)
  const normalizedHomeState = normalizeHomeState(homeState, initialHomeState)
  const displayedHomeState = shouldStartOnFeed ? initialHomeState : normalizedHomeState
  const homeStateRef = useRef(displayedHomeState)
  const hasAppliedHomeFeedIntentRef = useRef(false)
  const recommendedArticles = useMemo(() => {
    const articlesById = new Map(articles.map((article) => [article.id, article]))

    return displayedHomeState.recommendedArticleIds.map((id) => articlesById.get(id)).filter(Boolean)
  }, [articles, displayedHomeState.recommendedArticleIds])
  const swipeStartRef = useRef(null)

  const commitHomeState = useCallback(
    (nextState) => {
      const versionedState = { ...nextState, version: HOME_STATE_VERSION }
      homeStateRef.current = versionedState
      rememberInCurrentHistoryEntry(HOME_STATE_KEY, versionedState)
      router.remember(versionedState, HOME_STATE_KEY)
      setHomeState(versionedState)
    },
    [setHomeState],
  )

  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  useEffect(() => {
    homeStateRef.current = normalizedHomeState
  }, [normalizedHomeState])

  useEffect(() => {
    if (!shouldStartOnFeed || hasAppliedHomeFeedIntentRef.current) return

    hasAppliedHomeFeedIntentRef.current = true
    commitHomeState(initialHomeState)
    setShouldStartOnFeed(false)
  }, [commitHomeState, initialHomeState, shouldStartOnFeed])

  function changeMode(nextMode) {
    if (nextMode === displayedHomeState.mode) return

    commitHomeState({ ...homeStateRef.current, mode: nextMode })
    window.scrollTo({ top: 0 })
  }

  function handleModeChange(_, nextMode) {
    changeMode(nextMode)
  }

  function handlePointerDown(event) {
    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
  }

  function handlePointerUp(event) {
    const swipeStart = swipeStartRef.current
    swipeStartRef.current = null

    const nextMode = getSwipeMode(displayedHomeState.mode, swipeStart, {
      x: event.clientX,
      y: event.clientY,
    })

    if (nextMode) changeMode(nextMode)
  }

  return (
    <>
      <SeoHead
        title="ホーム"
        description="「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。"
        canonicalPath="/"
      />
      <PageContainer id="home" sx={{ pt: 0 }}>
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Box
            sx={{
              position: "sticky",
              top: { xs: 45, sm: 53 },
              zIndex: (theme) => theme.zIndex.appBar - 1,
              bgcolor: "background.default",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Tabs
              value={displayedHomeState.mode}
              onChange={handleModeChange}
              aria-label="トップページの表示切り替え"
              variant="fullWidth"
              sx={{ minHeight: HOME_TAB_HEIGHT }}
            >
              {HOME_TABS.map((tab) => (
                <Tab key={tab.id} label={tab.label} value={tab.id} sx={compactTabSx} />
              ))}
            </Tabs>
          </Box>
          <Box
            data-testid="home-articles-swipe-area"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              swipeStartRef.current = null
            }}
            sx={{ pt: 1 }}
          >
            {HOME_TABS.find((tab) => tab.id === displayedHomeState.mode)?.renderContent({
              articles,
              recommendedArticles,
            })}
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
