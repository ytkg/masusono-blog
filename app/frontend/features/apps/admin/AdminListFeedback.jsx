import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import StatusAlert from "../../../shared/components/StatusAlert"
import LoadingStatus from "../../../shared/components/LoadingStatus"
import EmptyStatus from "../../../shared/components/EmptyStatus"

export function AdminLoadingMessage({ loading }) {
  return loading ? <LoadingStatus>読み込み中…</LoadingStatus> : null
}

export function AdminEmptyMessage({ loading, error, count, children }) {
  return !loading && !error && count === 0 ? <EmptyStatus>{children}</EmptyStatus> : null
}

export function AdminListError({ error, onRetry }) {
  return error ? (
    <Box sx={{ mt: 2 }}>
      <StatusAlert>{error}</StatusAlert>
      <Button onClick={onRetry}>再試行</Button>
    </Box>
  ) : null
}

export function LoadMoreButton({ hasMore, loading, loadingMore, onClick }) {
  return hasMore ? (
    <Box sx={{ mt: 3 }}>
      {loadingMore ? <LoadingStatus>読み込み中…</LoadingStatus> : null}
      <Button onClick={onClick} disabled={loading || loadingMore} variant="outlined">
        {loadingMore ? "読み込み中…" : "もっと見る"}
      </Button>
    </Box>
  ) : null
}
