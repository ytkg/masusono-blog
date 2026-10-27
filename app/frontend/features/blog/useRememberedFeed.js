import { useCallback, useEffect, useState } from "react"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"

export default function useRememberedFeed(key, load) {
  const { state: data, commit } = useImmediateRemember(null, key)
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)
  const retry = useCallback(() => {
    setFailed(false)
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    if (data !== null) return
    const controller = new AbortController()
    load({ signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) commit(result)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [data, commit, attempt, load])

  return { data, failed, retry }
}
