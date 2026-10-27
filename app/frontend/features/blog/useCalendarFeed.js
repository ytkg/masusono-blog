import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import useRememberedFeed from "./useRememberedFeed"
import { fetchCalendarGroups } from "./feedRequests"

export default function useCalendarFeed() {
  const { data: groups, failed, retry } = useRememberedFeed("home-calendar", fetchCalendarGroups)
  const [todayMonth, todayDay] = new Date()
    .toLocaleDateString("en-US", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric" })
    .split("/")
    .map(Number)
  const { state: selection, commit: commitSelection } = useImmediateRemember(
    { month: todayMonth, day: null },
    "home-calendar-selection",
  )

  function changeMonth(month) {
    commitSelection({ month, day: null })
  }

  function selectDay(day) {
    commitSelection({ ...selection, day })
  }

  return { groups, selection, todayMonth, todayDay, failed, retry, changeMonth, selectDay }
}
