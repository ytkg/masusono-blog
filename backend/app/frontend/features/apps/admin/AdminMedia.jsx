import { useEffect, useRef, useState } from "react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { requestJson } from "../../../shared/lib/fetchJson"

function fileName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop())
  } catch {
    return "ファイル"
  }
}

function isImage(item) {
  return Number.isFinite(item.width) && Number.isFinite(item.height)
}

function MediaPreview({ item }) {
  return isImage(item) ? (
    <Box
      component="img"
      src={item.url}
      alt={item.alt || fileName(item.url)}
      loading="lazy"
      sx={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ) : (
    <Box sx={{ display: "grid", placeItems: "center", width: "100%", height: "100%", bgcolor: "action.hover" }}>
      <InsertDriveFileIcon sx={{ fontSize: 52 }} />
    </Box>
  )
}

export default function AdminMedia({ onBack, onUnauthorized }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setItems([])
    setHasMore(false)
    setTotalCount(0)
    const params = new URLSearchParams({ page: "1" })
    if (query) params.set("q", query)

    requestJson(`/api/app/management/media?${params}`, { signal: controller.signal })
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        setItems(result.media)
        setPage(result.page)
        setHasMore(result.has_more)
        setTotalCount(result.total_count)
      })
      .catch((failure) => {
        if (controller.signal.aborted) return
        if (failure.status === 401) {
          onUnauthorized()
        } else {
          setError("メディアを取得できませんでした。時間をおいて再度お試しください。")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      requestIdRef.current += 1
    }
  }, [query, refreshKey, onUnauthorized])

  async function loadMore() {
    const requestId = requestIdRef.current
    setLoadingMore(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page + 1) })
      if (query) params.set("q", query)
      const result = await requestJson(`/api/app/management/media?${params}`)
      if (requestId !== requestIdRef.current) return
      setItems((current) => [...current, ...result.media])
      setPage(result.page)
      setHasMore(result.has_more)
    } catch (failure) {
      if (requestId !== requestIdRef.current) return
      if (failure.status === 401) {
        onUnauthorized()
      } else {
        setError("メディアを取得できませんでした。時間をおいて再度お試しください。")
      }
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={onBack}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: "inherit",
          mb: 2,
          p: 0,
          border: 0,
          bgcolor: "transparent",
          cursor: "pointer",
        }}
      >
        <ArrowBackIcon fontSize="small" />
        管理画面
      </Box>
      <Typography component="h3" variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        メディア一覧
      </Typography>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          const nextQuery = search.trim()
          if (nextQuery === query) {
            setRefreshKey((current) => current + 1)
          } else {
            setQuery(nextQuery)
          }
        }}
        sx={{ display: "flex", gap: 1, mb: 2 }}
      >
        <TextField
          label="ファイル名で検索"
          name="q"
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained">
          検索
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {totalCount}件
      </Typography>
      {loading ? <Typography>読み込み中…</Typography> : null}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 2 }}>
        {items.map((item) => (
          <Box
            component="button"
            type="button"
            key={item.id}
            onClick={() => setSelected(item)}
            aria-label={`${fileName(item.url)}の詳細を表示`}
            sx={{
              p: 0,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Box sx={{ height: 140 }}>
              <MediaPreview item={item} />
            </Box>
            <Typography
              variant="caption"
              component="span"
              sx={{ display: "block", p: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {fileName(item.url)}
            </Typography>
          </Box>
        ))}
      </Box>
      {!loading && !error && items.length === 0 ? <Typography>メディアが見つかりませんでした。</Typography> : null}
      {error ? (
        <Box sx={{ mt: 2 }}>
          <Typography role="alert">{error}</Typography>
          <Button onClick={() => setRefreshKey((current) => current + 1)}>再試行</Button>
        </Box>
      ) : null}
      {hasMore ? (
        <Button onClick={loadMore} disabled={loadingMore || loading} variant="outlined" sx={{ mt: 3 }}>
          {loadingMore ? "読み込み中…" : "もっと見る"}
        </Button>
      ) : null}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
        aria-labelledby="media-detail-title"
      >
        {selected ? (
          <>
            <DialogTitle id="media-detail-title">{fileName(selected.url)}</DialogTitle>
            <DialogContent>
              <Box sx={{ height: "min(60vh, 560px)", mb: 2 }}>
                <MediaPreview item={selected} />
              </Box>
              {isImage(selected) ? (
                <Typography>
                  画像サイズ: {selected.width} × {selected.height} px
                </Typography>
              ) : null}
              {selected.alt ? <Typography>代替テキスト: {selected.alt}</Typography> : null}
              {selected.createdAt ? (
                <Typography>登録日時: {new Date(selected.createdAt).toLocaleString("ja-JP")}</Typography>
              ) : null}
              {selected.tags?.length ? <Typography>タグ: {selected.tags.join("、")}</Typography> : null}
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </>
  )
}
