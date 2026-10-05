import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"

export default function LoadMoreArticles({ hasMore, loading, failed, loadMore, buffer }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!hasMore || loading || failed || !window.IntersectionObserver) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      { rootMargin: `${buffer}px` },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, failed, loadMore, buffer])

  if (!hasMore) return null

  return (
    <Box ref={sentinelRef} sx={{ py: 2, textAlign: "center" }}>
      <Box role="status" aria-live="polite">
        {loading ? <Typography color="text.secondary">記事を読み込んでいます…</Typography> : null}
        {failed ? <Typography color="text.secondary">記事を読み込めませんでした。</Typography> : null}
      </Box>
      {!loading ? <Button onClick={loadMore}>{failed ? "再試行" : "さらに読み込む"}</Button> : null}
    </Box>
  )
}
