import { CONTENT_STICKY_TOP } from "../shared/pageLayout"
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
      <PageContainer id="home" sx={{ pt: { xs: 0, sm: 0 } }}>
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Box
            sx={{
              mx: { xs: -2, sm: -3 },
              bgcolor: "primary.main",
              color: "#fff",
              px: { xs: 3, sm: 6 },
              py: { xs: 4, sm: 7 },
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 380, sm: 450 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: 10, letterSpacing: "0.22em", fontWeight: 800 }}>
              MASUDA & OTHERS — WEB JOURNAL
            </Typography>
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                right: -40,
                top: 30,
                width: 190,
                height: 190,
                border: "1px solid #ffffff55",
                borderRadius: "50%",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 25,
                  border: "1px solid #ffffff55",
                  borderRadius: "50%",
                },
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
                fontSize: { xs: 44, sm: 72 },
                fontWeight: 500,
                lineHeight: 1.4,
                letterSpacing: "-0.07em",
                position: "relative",
                my: 4,
              }}
            >
              とりとめなく、
              <br />
              おもしろく。
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 2 }}>
              <Typography sx={{ fontSize: 12, lineHeight: 1.9 }}>
                日記も、寄り道も、遊びも。
                <br />
                増田とその他の小さなインターネット。
              </Typography>
              <Typography
                aria-hidden="true"
                sx={{
                  bgcolor: "#dcf89c",
                  color: "#132455",
                  width: 54,
                  height: 54,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  fontSize: 26,
                }}
              >
                ↓
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              position: "sticky",
              top: CONTENT_STICKY_TOP,
              zIndex: (theme) => theme.zIndex.appBar - 1,
              borderRadius: 999,
              my: 2,
              p: 0.5,
              bgcolor: "#e1e5ff",
            }}
          >
            <Tabs
              value={mode}
              onChange={handleModeChange}
              aria-label="トップページの表示切り替え"
              variant="fullWidth"
              sx={{
                minHeight: HOME_TAB_HEIGHT,
                "& .MuiTabs-indicator": { display: "none" },
                "& .Mui-selected": { bgcolor: "#fff", borderRadius: 999, color: "text.primary" },
              }}
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
