import { HEADER_HEIGHT } from "../shared/pageLayout"
import useHomeTabState from "../features/blog/useHomeTabState"
import useHomeArticles from "../features/blog/useHomeArticles"
import LoadMoreArticles from "../features/blog/LoadMoreArticles"
import { useEffect } from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import { HOME_TABS } from "../features/blog/HomeTabs"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

const HOME_TAB_HEIGHT = 38
const compactTabSx = {
  minHeight: HOME_TAB_HEIGHT,
  py: 0.75,
}

export default function Home({ articles = [], pagination }) {
  const { mode, changeMode } = useHomeTabState()
  const feed = useHomeArticles(articles, pagination)

  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  function handleModeChange(_, nextMode) {
    changeMode(nextMode)
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
              top: HEADER_HEIGHT,
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
              {HOME_TABS.map((tab) => (
                <Tab key={tab.id} label={tab.label} value={tab.id} sx={compactTabSx} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ pt: 1 }}>
            {HOME_TABS.find((tab) => tab.id === mode)?.renderContent({
              articles: feed.articles,
            })}
            <LoadMoreArticles {...feed} mode={mode} />
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
