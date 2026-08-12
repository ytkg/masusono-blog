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

const HOME_TAB_HEIGHT = 38
const HOME_STATE_KEY = "home-state"
const HOME_STATE_VERSION = 2

const compactTabSx = {
  minHeight: HOME_TAB_HEIGHT,
  py: 0.75,
}

function normalizeHomeState(state, fallbackState) {
  return {
    ...fallbackState,
    mode: isHomeTabId(state?.mode) ? state.mode : DEFAULT_HOME_TAB_ID,
    version: HOME_STATE_VERSION,
  }
}

export default function Home({ articles = [] }) {
  const initialHomeState = useMemo(
    () => ({
      mode: DEFAULT_HOME_TAB_ID,
      version: HOME_STATE_VERSION,
    }),
    [],
  )
  const [shouldStartOnFeed, setShouldStartOnFeed] = useState(consumeHomeFeedIntent)
  const [homeState, setHomeState] = useRemember(initialHomeState, HOME_STATE_KEY)
  const normalizedHomeState = normalizeHomeState(homeState, initialHomeState)
  const displayedHomeState = shouldStartOnFeed ? initialHomeState : normalizedHomeState
  const homeStateRef = useRef(displayedHomeState)
  const hasAppliedHomeFeedIntentRef = useRef(false)
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
          <Box sx={{ pt: 1 }}>
            {HOME_TABS.find((tab) => tab.id === displayedHomeState.mode)?.renderContent({
              articles,
            })}
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
