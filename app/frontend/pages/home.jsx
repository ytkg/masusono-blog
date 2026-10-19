import { HEADER_HEIGHT } from "../layouts/pageLayout"
import useHomeTabState from "../features/blog/useHomeTabState"
import useHomeArticles from "../features/blog/useHomeArticles"
import LoadMoreArticles from "../features/blog/LoadMoreArticles"
import { useEffect, useId } from "react"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import { HOME_TABS } from "../features/blog/HomeTabs"
import PageContainer from "../shared/components/PageContainer"
import SeoHead from "../shared/components/SeoHead"

const HOME_TAB_HEIGHT = 44
const compactTabSx = {
  minHeight: HOME_TAB_HEIGHT,
  py: 0.75,
}

export default function Home({ articles = [], pagination }) {
  const tabsId = useId()
  const { mode, changeMode } = useHomeTabState()
  const feed = useHomeArticles(articles, pagination)
  const activeTab = HOME_TABS.find((tab) => tab.id === mode)

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
        description="増田とその仲間たちが、日々の出来事や思ったことを気ままに綴る「増田とその他！」。日常のブログから、気軽に遊べるミニゲームまで。"
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
              py: 1,
              "& .MuiTabs-root": { bgcolor: "#e8e8ed", borderRadius: 3, p: 0.5 },
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": { borderRadius: 2.5, color: "text.secondary" },
              "& .MuiTab-root.Mui-selected": {
                bgcolor: "background.paper",
                color: "primary.main",
                boxShadow: "0 1px 4px rgba(29, 29, 31, 0.1)",
                fontWeight: 700,
              },
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
                <Tab
                  key={tab.id}
                  id={`${tabsId}-${tab.id}`}
                  aria-controls={`${tabsId}-panel`}
                  label={tab.label}
                  value={tab.id}
                  sx={compactTabSx}
                />
              ))}
            </Tabs>
          </Box>
          <Box
            role="tabpanel"
            id={`${tabsId}-panel`}
            aria-labelledby={`${tabsId}-${mode}`}
            sx={{ pt: mode === "calendar" ? 0.5 : 1 }}
          >
            {activeTab?.renderContent({
              articles: feed.articles,
              hasMore: feed.hasMore,
            })}
            {activeTab?.articleLoadBuffer !== undefined ? (
              <LoadMoreArticles {...feed} buffer={activeTab.articleLoadBuffer} />
            ) : null}
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
