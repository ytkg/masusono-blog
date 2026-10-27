import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import useRememberedFeed from "./useRememberedFeed"
import { fetchSentenceArticles } from "./feedRequests"
import SentenceFeed from "./SentenceFeed"

export default function AllSentenceFeed() {
  const { data: articles, failed, retry } = useRememberedFeed("home-sentence-articles", fetchSentenceArticles)

  if (articles !== null) return <SentenceFeed articles={articles} hasMore={false} />

  return (
    <Box sx={{ py: 2, textAlign: "center" }}>
      <Typography role="status" color="text.secondary">
        {failed ? "記事を読み込めませんでした。" : "記事を読み込んでいます…"}
      </Typography>
      {failed ? <Button onClick={retry}>再試行</Button> : null}
    </Box>
  )
}
