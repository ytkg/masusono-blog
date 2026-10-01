import Box from "@mui/material/Box"
import EmptyStatus from "../../shared/components/EmptyStatus"
import SentenceFeedCard from "./SentenceFeedCard"
import useSentenceFeedState from "./useSentenceFeedState"
import useSentenceFeedLayout from "./useSentenceFeedLayout"
import useSentenceFeedProgress from "./useSentenceFeedProgress"

export default function SentenceFeed({ articles = [] }) {
  const feed = useSentenceFeedState(articles)
  const { items } = feed
  const { containerRef, height } = useSentenceFeedLayout(items)
  useSentenceFeedProgress(feed)

  if (items.length === 0) {
    return <EmptyStatus>書き出しを表示できる記事がありません。</EmptyStatus>
  }

  return (
    <Box
      ref={containerRef}
      data-testid="sentence-feed"
      sx={{ position: "relative", minHeight: height, overflowX: "clip", px: { xs: 0, sm: 1.5 } }}
    >
      {items.map(({ article, hasRevealed, key, sentence, revealDelay }) => (
        <SentenceFeedCard
          article={article}
          hasRevealed={hasRevealed}
          key={key}
          revealDelay={revealDelay}
          sentence={sentence}
        />
      ))}
    </Box>
  )
}
