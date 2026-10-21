import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { requestJson } from "@/shared/lib/fetchJson"
import useImmediateRemember from "@/shared/hooks/useImmediateRemember"
import SentenceFeed from "./SentenceFeed"

export default function AllSentenceFeed() {
  const { state: articles, commit } = useImmediateRemember(null, "home-sentence-articles")
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (articles !== null) return
    const controller = new AbortController()
    requestJson("/api/app/sentence_articles", { signal: controller.signal })
      .then((result) => {
        if (
          !Array.isArray(result?.articles) ||
          result.articles.some((article) => typeof article?.id !== "string" || typeof article.content !== "string")
        )
          throw new Error("Invalid sentence articles")
        if (!controller.signal.aborted) commit(result.articles)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [articles, commit, attempt])

  if (articles !== null) return <SentenceFeed articles={articles} hasMore={false} />

  return (
    <Box sx={{ py: 2, textAlign: "center" }}>
      <Typography role="status" color="text.secondary">
        {failed ? "記事を読み込めませんでした。" : "記事を読み込んでいます…"}
      </Typography>
      {failed ? (
        <Button
          onClick={() => {
            setFailed(false)
            setAttempt((value) => value + 1)
          }}
        >
          再試行
        </Button>
      ) : null}
    </Box>
  )
}
