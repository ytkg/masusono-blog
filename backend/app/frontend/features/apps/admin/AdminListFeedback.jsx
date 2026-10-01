import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"

export function AdminLoadingMessage({ loading }) {
  return loading ? <Typography>読み込み中…</Typography> : null
}

export function AdminEmptyMessage({ loading, error, count, children }) {
  return !loading && !error && count === 0 ? <Typography>{children}</Typography> : null
}

export function AdminListError({ error, onRetry }) {
  return error ? (
    <Box sx={{ mt: 2 }}>
      <Typography role="alert">{error}</Typography>
      <Button onClick={onRetry}>再試行</Button>
    </Box>
  ) : null
}

export function LoadMoreButton({ hasMore, loading, loadingMore, onClick }) {
  return hasMore ? (
    <Button onClick={onClick} disabled={loading || loadingMore} variant="outlined" sx={{ mt: 3 }}>
      {loadingMore ? "読み込み中…" : "もっと見る"}
    </Button>
  ) : null
}
