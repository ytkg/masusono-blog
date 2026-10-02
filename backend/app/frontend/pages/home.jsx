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
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
              mt: 3,
              mb: 2,
              border: "1px solid",
              borderColor: "text.primary",
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: { xs: 310, md: 440 },
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", color: "primary.main" }}>
                MASUDA & OTHERS / JOURNAL
              </Typography>
              <Typography
                component="h1"
                sx={{ fontSize: { xs: 46, sm: 64 }, fontWeight: 900, letterSpacing: "-0.08em", lineHeight: 1.1, my: 3 }}
              >
                日々の余白に、
                <br />
                ちょっと寄り道。
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.9 }}>
                増田と、その他のみんなの記録。
                <br />
                出来事、考えごと、ときどき遊び。
              </Typography>
            </Box>
            <Box
              aria-hidden="true"
              sx={{
                bgcolor: "primary.main",
                color: "#252820",
                minHeight: { xs: 180, md: 440 },
                p: 3,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: { xs: 260, md: 380 },
                  height: { xs: 260, md: 380 },
                  borderRadius: "50%",
                  border: "1px solid #252820",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 24,
                    borderRadius: "50%",
                    border: "1px solid #252820",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 48,
                    borderRadius: "50%",
                    border: "1px solid #252820",
                  },
                }}
              />
              <Typography
                sx={{
                  position: "relative",
                  fontSize: { xs: 100, md: 180 },
                  fontWeight: 900,
                  lineHeight: 1,
                  transform: "rotate(-12deg)",
                }}
              >
                余白
              </Typography>
              <Typography sx={{ position: "absolute", bottom: 20, left: 24, fontSize: 11, letterSpacing: "0.15em" }}>
                EVERYDAY IS A STORY. ↗
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
