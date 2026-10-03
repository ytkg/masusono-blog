import AdminArticleEditor from "./AdminArticleEditor"
import Button from "@mui/material/Button"
import useAdminArticles from "./useAdminArticles"
import AdminSectionHeader from "./AdminSectionHeader"
import AdminSearchForm from "./AdminSearchForm"
import { AdminLoadingMessage, AdminEmptyMessage, AdminListError, LoadMoreButton } from "./AdminListFeedback"
import { useState } from "react"
import Box from "@mui/material/Box"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

const statuses = [
  ["all", "すべて"],
  ["published", "公開中"],
  ["draft", "下書き"],
  ["published_and_draft", "公開中・下書きあり"],
  ["closed", "公開終了"],
]

const articleStatusLabel = {
  PUBLISH: "公開中",
  DRAFT: "下書き",
  PUBLISH_AND_DRAFT: "公開中・下書きあり",
  CLOSED: "公開終了",
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? "-" : date.toLocaleString("ja-JP")
}

export default function AdminArticles({ onBack, onUnauthorized, csrfToken, onDirtyChange, canLeave }) {
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [appliedStatus, setAppliedStatus] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)

  const { items, totalCount, hasMore, loading, loadingMore, error, loadMore } = useAdminArticles({
    query,
    status: appliedStatus,
    refreshKey,
    onUnauthorized,
  })

  function submitSearch(event) {
    event.preventDefault()
    const nextQuery = search.trim()
    if (nextQuery === query && selectedStatus === appliedStatus) setRefreshKey((current) => current + 1)
    else {
      setQuery(nextQuery)
      setAppliedStatus(selectedStatus)
    }
  }

  return (
    <>
      {selectedId ? (
        <AdminArticleEditor
          id={selectedId}
          csrfToken={csrfToken}
          onDirtyChange={onDirtyChange}
          onBack={() => {
            if (canLeave()) setSelectedId(null)
          }}
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      ) : null}
      <Box hidden={Boolean(selectedId)}>
        <AdminSectionHeader title="記事一覧" onBack={onBack} />
        <AdminSearchForm label="タイトルで検索" value={search} onChange={setSearch} onSubmit={submitSearch}>
          <TextField
            select
            label="公開状態"
            name="status"
            size="small"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            sx={{ minWidth: { sm: 180 } }}
          >
            {statuses.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </AdminSearchForm>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {totalCount}件
        </Typography>
        <AdminLoadingMessage loading={loading} />
        <AdminEmptyMessage loading={loading} error={error} count={items.length}>
          記事が見つかりませんでした。
        </AdminEmptyMessage>
        <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
          {items.map((item) => (
            <Box
              component="li"
              key={item.id}
              sx={{ p: { xs: 1, sm: 1.5 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
            >
              <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                <Button
                  disabled={item.status === "CLOSED"}
                  onClick={() => setSelectedId(item.id)}
                  sx={{
                    p: 0,
                    display: "block",
                    minWidth: 0,
                    width: "100%",
                    textAlign: "left",
                    justifyContent: "flex-start",
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "inherit",
                    lineHeight: "inherit",
                  }}
                >
                  {item.title || "（タイトルなし）"}
                </Button>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {articleStatusLabel[item.status] || item.status}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                更新: {formatDate(item.updated_at)}
              </Typography>
            </Box>
          ))}
        </Stack>
        <AdminListError error={error} onRetry={() => setRefreshKey((current) => current + 1)} />
        <LoadMoreButton hasMore={hasMore} loading={loading} loadingMore={loadingMore} onClick={loadMore} />
      </Box>
    </>
  )
}
