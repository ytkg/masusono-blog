import AdminSectionHeader from "./AdminSectionHeader"
import AdminSearchForm from "./AdminSearchForm"
import { AdminLoadingMessage, AdminEmptyMessage, AdminListError, LoadMoreButton } from "./AdminListFeedback"
import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { requestJson } from "../../../shared/lib/fetchJson"

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
const loadError = "記事を取得できませんでした。時間をおいて再度お試しください。"

function articlesUrl(page, query, status) {
  const params = new URLSearchParams({ page: String(page), status })
  if (query) params.set("q", query)
  return `/api/app/management/articles?${params}`
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? "-" : date.toLocaleString("ja-JP")
}

export default function AdminArticles({ onBack, onUnauthorized }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [appliedStatus, setAppliedStatus] = useState("all")
  const [refreshKey, setRefreshKey] = useState(0)
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
    requestJson(articlesUrl(1, query, appliedStatus), { signal: controller.signal })
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        setItems(result.articles)
        setPage(result.page)
        setHasMore(result.has_more)
        setTotalCount(result.total_count)
      })
      .catch((failure) => {
        if (controller.signal.aborted) return
        if (failure.status === 401) onUnauthorized()
        else setError(loadError)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      requestIdRef.current += 1
    }
  }, [query, appliedStatus, refreshKey, onUnauthorized])

  async function loadMore() {
    const requestId = requestIdRef.current
    setLoadingMore(true)
    setError(null)
    try {
      const result = await requestJson(articlesUrl(page + 1, query, appliedStatus))
      if (requestId !== requestIdRef.current) return
      setItems((current) => [...current, ...result.articles])
      setPage(result.page)
      setHasMore(result.has_more)
    } catch (failure) {
      if (requestId !== requestIdRef.current) return
      if (failure.status === 401) onUnauthorized()
      else setError(loadError)
    } finally {
      setLoadingMore(false)
    }
  }

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
              {item.title || "（タイトルなし）"}
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
    </>
  )
}
