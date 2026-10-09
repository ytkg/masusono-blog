import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { requestJson } from "@/shared/lib/fetchJson"
import ArticlesList from "./ArticlesList"

export default function RecommendedFeed() {
  const [articles, setArticles] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    requestJson("/api/app/recommended_articles", { signal: controller.signal })
      .then((result) => {
        if (!Array.isArray(result.articles)) throw new Error("Invalid recommended articles")
        if (!controller.signal.aborted) setArticles(result.articles)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [attempt])

  function redraw() {
    setLoading(true)
    setFailed(false)
    setAttempt((value) => value + 1)
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={redraw} disabled={loading}>
          {failed ? "再試行" : "再抽選"}
        </Button>
      </Box>
      {loading || failed ? (
        <Typography role="status" color="text.secondary" sx={{ textAlign: "center" }}>
          {failed ? "記事を読み込めませんでした。" : "記事を読み込んでいます…"}
        </Typography>
      ) : null}
      {articles !== null ? <ArticlesList articles={articles} emptyMessage="記事がありません。" /> : null}
    </Box>
  )
}
