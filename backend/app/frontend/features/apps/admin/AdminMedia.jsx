import useAdminMedia from "./useAdminMedia"
import AdminSectionHeader from "./AdminSectionHeader"
import AdminSearchForm from "./AdminSearchForm"
import { AdminLoadingMessage, AdminEmptyMessage, AdminListError, LoadMoreButton } from "./AdminListFeedback"
import { useRef, useState } from "react"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
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

const uploadUrl = "/api/app/management/media"
const maxFileSize = 5 * 1024 * 1024

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
      <InsertDriveFileIcon sx={{ fontSize: { xs: 32, sm: 52 } }} />
    </Box>
  )
}

export default function AdminMedia({ csrfToken, onBack, onUnauthorized }) {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const { items, totalCount, hasMore, loading, loadingMore, error, loadMore } = useAdminMedia({
    query,
    refreshKey,
    onUnauthorized,
  })

  async function uploadFile(file) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("画像ファイルを選択してください。")
      fileInputRef.current.value = ""
      return
    }
    if (file.size > maxFileSize) {
      setUploadError("画像ファイルは5MB以下にしてください。")
      fileInputRef.current.value = ""
      return
    }

    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      await requestJson(uploadUrl, {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-Token": csrfToken },
        body: formData,
      })
      setSearch("")
      setQuery("")
      setRefreshKey((current) => current + 1)
    } catch (failure) {
      if (failure.status === 401) {
        onUnauthorized()
      } else {
        setUploadError(failure.message || "画像をアップロードできませんでした。時間をおいて再度お試しください。")
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <AdminSectionHeader title="メディア一覧" onBack={onBack} />
      <Box sx={{ mb: { xs: 1, sm: 2 } }}>
        <Button component="label" variant="contained" disabled={uploading}>
          {uploading ? "アップロード中…" : "アップロード"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={(event) => uploadFile(event.target.files?.[0])}
          />
        </Button>
        {uploadError ? (
          <Typography role="alert" color="error" sx={{ mt: 1 }}>
            {uploadError}
          </Typography>
        ) : null}
      </Box>
      <AdminSearchForm
        label="ファイル名で検索"
        value={search}
        onChange={setSearch}
        onSubmit={(event) => {
          event.preventDefault()
          const nextQuery = search.trim()
          if (nextQuery === query) {
            setRefreshKey((current) => current + 1)
          } else {
            setQuery(nextQuery)
          }
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
        {totalCount}件
      </Typography>
      <AdminLoadingMessage loading={loading} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(4, minmax(0, 1fr))", sm: "repeat(auto-fill, minmax(140px, 1fr))" },
          gap: { xs: 0.5, sm: 2 },
        }}
      >
        {items.map((item) => (
          <Box
            component="button"
            type="button"
            key={item.id}
            onClick={() => setSelected(item)}
            aria-label={`${fileName(item.url)}の詳細を表示`}
            sx={{
              minWidth: 0,
              width: "100%",
              p: 0,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: { xs: 1, sm: 2 },
              overflow: "hidden",
              bgcolor: "background.paper",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Box sx={{ aspectRatio: { xs: "1", sm: "auto" }, height: { xs: "auto", sm: 140 } }}>
              <MediaPreview item={item} />
            </Box>
            <Typography
              variant="caption"
              component="span"
              sx={{
                display: "block",
                p: { xs: 0.5, sm: 1 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fileName(item.url)}
            </Typography>
          </Box>
        ))}
      </Box>
      <AdminEmptyMessage loading={loading} error={error} count={items.length}>
        メディアが見つかりませんでした。
      </AdminEmptyMessage>
      <AdminListError error={error} onRetry={() => setRefreshKey((current) => current + 1)} />
      <LoadMoreButton hasMore={hasMore} loading={loading} loadingMore={loadingMore} onClick={loadMore} />
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
