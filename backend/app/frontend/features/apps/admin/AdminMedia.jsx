import MediaUploadField from "./MediaUploadField"
import MediaItemCard from "./MediaItemCard"
import MediaDetailDialog from "./MediaDetailDialog"
import useAdminMedia from "./useAdminMedia"
import AdminSectionHeader from "./AdminSectionHeader"
import AdminSearchForm from "./AdminSearchForm"
import { AdminLoadingMessage, AdminEmptyMessage, AdminListError, LoadMoreButton } from "./AdminListFeedback"
import { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function AdminMedia({ csrfToken, onBack, onUnauthorized }) {
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState(null)

  const { items, totalCount, hasMore, loading, loadingMore, error, loadMore } = useAdminMedia({
    query,
    refreshKey,
    onUnauthorized,
  })

  return (
    <>
      <AdminSectionHeader title="メディア一覧" onBack={onBack} />
      <MediaUploadField
        csrfToken={csrfToken}
        onUnauthorized={onUnauthorized}
        onUploaded={() => {
          setSearch("")
          setQuery("")
          setRefreshKey((current) => current + 1)
        }}
      />
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
          <MediaItemCard key={item.id} item={item} onSelect={setSelected} />
        ))}
      </Box>
      <AdminEmptyMessage loading={loading} error={error} count={items.length}>
        メディアが見つかりませんでした。
      </AdminEmptyMessage>
      <AdminListError error={error} onRetry={() => setRefreshKey((current) => current + 1)} />
      <LoadMoreButton hasMore={hasMore} loading={loading} loadingMore={loadingMore} onClick={loadMore} />
      <MediaDetailDialog selected={selected} onClose={() => setSelected(null)} />
    </>
  )
}
