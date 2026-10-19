import { useEffect, useRef, useState } from "react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import { consumeHomeFeedIntent } from "@/shared/lib/homeNavigation"
import { DEFAULT_HOME_TAB_ID, isHomeTabId } from "./HomeTabs"

const HOME_STATE_KEY = "home-state"
const INITIAL_HOME_STATE = { mode: DEFAULT_HOME_TAB_ID }

export default function useHomeTabState() {
  const [shouldStartOnFeed, setShouldStartOnFeed] = useState(consumeHomeFeedIntent)
  const { state: homeState, commit: commitHomeState } = useImmediateRemember(INITIAL_HOME_STATE, HOME_STATE_KEY)
  const mode = !shouldStartOnFeed && isHomeTabId(homeState?.mode) ? homeState.mode : DEFAULT_HOME_TAB_ID
  const hasAppliedHomeFeedIntentRef = useRef(false)
  useEffect(() => {
    if (!shouldStartOnFeed || hasAppliedHomeFeedIntentRef.current) return

    hasAppliedHomeFeedIntentRef.current = true
    commitHomeState(INITIAL_HOME_STATE)
    setShouldStartOnFeed(false)
  }, [commitHomeState, shouldStartOnFeed])

  function changeMode(nextMode) {
    if (nextMode === mode) return

    commitHomeState({ mode: nextMode })
    window.scrollTo({ top: 0 })
  }

  return { mode, changeMode }
}
