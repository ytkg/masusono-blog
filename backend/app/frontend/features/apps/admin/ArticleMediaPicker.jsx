import { useState } from "react"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import useAdminMedia from "./useAdminMedia"
import MediaItemCard from "./MediaItemCard"
import AdminSearchForm from "./AdminSearchForm"
import { AdminLoadingMessage, AdminEmptyMessage, AdminListError, LoadMoreButton } from "./AdminListFeedback"

export default function ArticleMediaPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const { items, hasMore, loading, loadingMore, error, loadMore } = useAdminMedia({ query, refreshKey })
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" aria-labelledby="article-media-title">
      <DialogTitle id="article-media-title">画像を選択</DialogTitle>
      <DialogContent>
        <AdminSearchForm
          label="ファイル名で検索"
          value={search}
          onChange={setSearch}
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(search.trim())
            setRefreshKey((key) => key + 1)
          }}
        />
        <AdminLoadingMessage loading={loading} />
        <AdminEmptyMessage loading={loading} error={error} count={items.length}>
          画像が見つかりませんでした。
        </AdminEmptyMessage>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 1 }}>
          {items.map((item) => (
            <MediaItemCard key={item.id} item={item} onSelect={onSelect} />
          ))}
        </Box>
        <AdminListError error={error} onRetry={() => setRefreshKey((key) => key + 1)} />
        <LoadMoreButton hasMore={hasMore} loading={loading} loadingMore={loadingMore} onClick={loadMore} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}
