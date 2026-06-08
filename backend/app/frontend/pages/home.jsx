import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import ArticlesList from "../features/blog/ArticlesList"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

const HOME_MODES = {
  feed: "feed",
  recommended: "recommended",
}

function pickRandomArticles(articles, count) {
  return [...articles].sort(() => Math.random() - 0.5).slice(0, count)
}

export default function Home({ articles = [] }) {
  const [mode, setMode] = useState(HOME_MODES.feed)
  const [recommendedArticles] = useState(() => pickRandomArticles(articles, 5))

  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  function handleModeChange(_, nextMode) {
    setMode(nextMode)
    window.scrollTo({ top: 0 })
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
            >
              <Tab label="フィード" value={HOME_MODES.feed} />
              <Tab label="おすすめ" value={HOME_MODES.recommended} />
            </Tabs>
          </Box>
          <Box sx={{ pt: 1 }}>
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
