import { useCallback, useLayoutEffect, useRef } from "react"
import { router, useRemember } from "@inertiajs/react"
import { rememberInCurrentHistoryEntry } from "../lib/rememberedState"

// Commit to history immediately so navigation can restore the latest visible state.
export default function useImmediateRemember(initialState, key) {
  const [state, setState] = useRemember(initialState, key)
  const stateRef = useRef(state)

  useLayoutEffect(() => {
    stateRef.current = state
  }, [state])

  const commit = useCallback(
    (nextState) => {
      stateRef.current = nextState
      rememberInCurrentHistoryEntry(key, nextState)
      router.remember(nextState, key)
      setState(nextState)
    },
    [key, setState],
  )

  return { state, stateRef, commit }
}
