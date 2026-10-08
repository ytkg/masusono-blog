import { useCallback, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { requestJson } from "@/shared/lib/fetchJson"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticlesList from "./ArticlesList"

export default function CalendarFeed() {
  const { state: groups, commit } = useImmediateRemember(null, "home-calendar")
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

  if (groups === null) {
    return (
      <Box sx={{ py: 2, textAlign: "center" }}>
        <Typography role="status" color="text.secondary">
          {failed ? "記事を読み込めませんでした。" : "記事を読み込んでいます…"}
        </Typography>
        {failed ? <Button onClick={retry}>再試行</Button> : null}
      </Box>
    )
  }
  if (!groups.length) return <EmptyStatus>記事がありません。</EmptyStatus>

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      {groups.map(({ monthDay, articles }, index) => {
        const [month, day] = monthDay.split("/").map(Number)
        const label = `${month}月${day}日`
        return (
          <Box
            component="section"
            key={monthDay}
            aria-label={label}
            sx={{
              borderBottom: index < groups.length - 1 ? "1px solid" : 0,
              borderColor: "divider",
              pb: index < groups.length - 1 ? 1.5 : 0,
            }}
          >
            <Typography component="h2" variant="body2" sx={{ mb: 2, color: "text.secondary", fontWeight: 700 }}>
              {label}
            </Typography>
            <ArticlesList articles={articles} />
          </Box>
        )
      })}
    </Box>
  )
}
