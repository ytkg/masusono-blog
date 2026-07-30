import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import ArticlesList from "../features/blog/ArticlesList"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

const HOME_MODES = Object.freeze({
  feed: "feed",
  recommended: "recommended",
})

const SWIPE_MIN_DISTANCE = 35
const SWIPE_AXIS_RATIO = 1.25
const HOME_TAB_HEIGHT = 38

const compactTabSx = {
  minHeight: HOME_TAB_HEIGHT,
  py: 0.75,
}

function pickRandomArticles(articles, count) {
  return [...articles].sort(() => Math.random() - 0.5).slice(0, count)
}

function getSwipeMode(start, end) {
  if (!start) return null

  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (absX < SWIPE_MIN_DISTANCE || absX < absY * SWIPE_AXIS_RATIO) return null

  return deltaX < 0 ? HOME_MODES.recommended : HOME_MODES.feed
}

export default function Home({ articles = [] }) {
  const [mode, setMode] = useState(HOME_MODES.feed)
  const [recommendedArticles] = useState(() => pickRandomArticles(articles, 5))
  const swipeStartRef = useRef(null)

  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  function changeMode(nextMode) {
    if (nextMode === mode) return

    setMode(nextMode)
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

    const nextMode = getSwipeMode(swipeStart, {
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
              value={mode}
              onChange={handleModeChange}
              aria-label="トップページの表示切り替え"
              variant="fullWidth"
              sx={{ minHeight: HOME_TAB_HEIGHT }}
            >
              <Tab label="フィード" value={HOME_MODES.feed} sx={compactTabSx} />
              <Tab label="おすすめ" value={HOME_MODES.recommended} sx={compactTabSx} />
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
            <ArticlesList
              articles={mode === HOME_MODES.feed ? articles : recommendedArticles}
              variant="divided"
              emptyMessage={mode === HOME_MODES.feed ? "記事がありません。" : "おすすめ記事がありません。"}
            />
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
