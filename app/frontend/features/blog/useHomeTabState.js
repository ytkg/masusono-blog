import { useEffect, useMemo, useRef, useState } from "react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import { consumeHomeFeedIntent } from "@/shared/lib/homeNavigation"
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
  const { state: homeState, commit: commitHomeState } = useImmediateRemember(initialHomeState, HOME_STATE_KEY)
  const normalizedHomeState = normalizeHomeState(homeState, initialHomeState)
  const displayedHomeState = shouldStartOnFeed ? initialHomeState : normalizedHomeState
  const hasAppliedHomeFeedIntentRef = useRef(false)
  useEffect(() => {
    if (!shouldStartOnFeed || hasAppliedHomeFeedIntentRef.current) return

    hasAppliedHomeFeedIntentRef.current = true
    commitHomeState(initialHomeState)
    setShouldStartOnFeed(false)
  }, [commitHomeState, initialHomeState, shouldStartOnFeed])

  function changeMode(nextMode) {
    if (nextMode === displayedHomeState.mode) return

    commitHomeState({ ...displayedHomeState, mode: nextMode })
    window.scrollTo({ top: 0 })
  }

  return { mode: displayedHomeState.mode, changeMode }
}
