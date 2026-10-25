import { useCallback, useEffect, useState } from "react"
import { requestJson } from "@/shared/lib/fetchJson"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"

export default function useCalendarFeed() {
  const { state: groups, commit } = useImmediateRemember(null, "home-calendar")
  const [todayMonth, todayDay] = new Date()
    .toLocaleDateString("en-US", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric" })
    .split("/")
    .map(Number)
  const { state: selection, commit: commitSelection } = useImmediateRemember(
    { month: todayMonth, day: null },
    "home-calendar-selection",
  )
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
        if (
          !Array.isArray(result?.groups) ||
          result.groups.some(
            (group) =>
              typeof group?.monthDay !== "string" ||
              !/^\d{2}\/\d{2}$/.test(group.monthDay) ||
              !Array.isArray(group.articles),
          )
        )
          throw new Error("Invalid calendar articles")
        if (!controller.signal.aborted) commit(result.groups)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [groups, commit, attempt])

  function changeMonth(month) {
    commitSelection({ month, day: null })
  }

  function selectDay(day) {
    commitSelection({ ...selection, day })
  }

  return { groups, selection, todayMonth, todayDay, failed, retry, changeMonth, selectDay }
}
