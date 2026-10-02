import { HEADER_HEIGHT } from "../shared/pageLayout"
import useHomeTabState from "../features/blog/useHomeTabState"
import { useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
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

export default function Home({ articles = [] }) {
  const { mode, changeMode } = useHomeTabState()

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
            sx={{ py: { xs: 4, sm: 7 }, borderBottom: "3px solid", borderColor: "text.primary", position: "relative" }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", color: "primary.main", mb: 2 }}>
              MASUDA & OTHERS / INDEPENDENT JOURNAL
            </Typography>
            <Typography
              component="h1"
              sx={{ fontSize: { xs: 44, sm: 86 }, fontWeight: 900, letterSpacing: "-0.07em", lineHeight: 1.08 }}
            >
              日々の余白に、
              <br />
              ちょっと寄り道。
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", mt: 3, gap: 2 }}>
              <Typography sx={{ fontSize: { xs: 13, sm: 15 }, color: "text.secondary" }}>
                増田と、その他のみんなの記録。
                <br />
                出来事、考えごと、ときどき遊び。
              </Typography>
              <Typography
                aria-hidden="true"
                sx={{ fontSize: { xs: 40, sm: 64 }, color: "primary.main", lineHeight: 1 }}
              >
                ↘
              </Typography>
            </Box>
          </Box>
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
              articles,
            })}
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
