import { useCallback, useEffect, useState } from "react"
import { requestJson } from "@/shared/lib/fetchJson"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"

export default function useCalendarFeed() {
  const { state: groups, commit } = useImmediateRemember(null, "home-calendar")
  const { state: expandedMonths, commit: commitExpandedMonths } = useImmediateRemember([], "home-calendar-months")
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)
  const retry = useCallback(() => {
    setFailed(false)
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    if (groups !== null) return
    const controller = new AbortController()
    requestJson("/api/app/calendar_articles", { signal: controller.signal })
      .then((result) => {
        if (!Array.isArray(result.groups)) throw new Error("Invalid calendar articles")
        if (!controller.signal.aborted) commit(result.groups)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [groups, commit, attempt])

  function changeMonth(month, expanded) {
    commitExpandedMonths(expanded ? [month] : [])
  }

  return { groups, expandedMonths, failed, retry, changeMonth }
}
