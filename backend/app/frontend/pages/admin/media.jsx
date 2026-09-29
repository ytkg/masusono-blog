import { useState } from "react"
import { Link } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"

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

export default function AdminMedia({
  media = [],
  total_count: totalCount = 0,
  has_more: initialHasMore = false,
  page: initialPage = 1,
  query = "",
}) {
  const [items, setItems] = useState(media)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadMore() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page + 1) })
      if (query) params.set("q", query)
      const response = await fetch(`/admin/media.json?${params}`, {
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
      if (response.redirected && new URL(response.url).pathname === "/admin/login") {
        window.location.assign("/admin/login")
        return
      }
      if (!response.ok) throw new Error("メディアを取得できませんでした。")
      const result = await response.json()
      setItems((current) => [...current, ...result.media])
      setPage(result.page)
      setHasMore(result.has_more)
    } catch {
      setError("メディアを取得できませんでした。時間をおいて再度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead title="メディア一覧" description="管理画面のメディア一覧" canonicalPath="/admin/media" />
      <PageContainer id="admin-media">
        <Box
          component={Link}
          href="/admin"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "inherit", mb: 2 }}
        >
          <ArrowBackIcon fontSize="small" />
          管理画面
        </Box>
        <Typography component="h1" variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          メディア一覧
        </Typography>
        <Box component="form" action="/admin/media" method="get" sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField label="ファイル名で検索" name="q" size="small" defaultValue={query} fullWidth />
          <Button type="submit" variant="contained">
            検索
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {totalCount}件
        </Typography>
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
        {items.length === 0 ? <Typography>メディアが見つかりませんでした。</Typography> : null}
        {error ? (
          <Typography role="alert" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : null}
        {hasMore ? (
          <Button onClick={loadMore} disabled={loading} variant="outlined" sx={{ mt: 3 }}>
            {loading ? "読み込み中…" : "もっと見る"}
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
      </PageContainer>
    </>
  )
}
