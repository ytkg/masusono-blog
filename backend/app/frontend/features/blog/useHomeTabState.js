import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { router, useRemember } from "@inertiajs/react"
import { consumeHomeFeedIntent } from "@/shared/lib/homeNavigation"
import { rememberInCurrentHistoryEntry } from "@/shared/lib/rememberedState"
import { DEFAULT_HOME_TAB_ID, isHomeTabId } from "./HomeTabs"

const HOME_STATE_KEY = "home-state"
const HOME_STATE_VERSION = 2

function normalizeHomeState(state, fallbackState) {
  return {
    ...fallbackState,
    mode: isHomeTabId(state?.mode) ? state.mode : DEFAULT_HOME_TAB_ID,
    version: HOME_STATE_VERSION,
  }
}

export default function useHomeTabState() {
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

  return { mode: displayedHomeState.mode, changeMode }
}
