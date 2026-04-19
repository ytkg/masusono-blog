import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { getApiErrorDisplayMessage } from "@/shared/lib/fetchJson"
import NumbersMetricsGrid from "./NumbersMetricsGrid"

const ERROR_MESSAGES_BY_CODE = {
  upstream_timeout: "応答が遅れています。少し待ってから再度お試しください。",
  upstream_rate_limited: "アクセスが集中しています。少し待ってから再度お試しください。",
  upstream_connection_error: "接続に失敗しました。少し待ってから再度お試しください。",
}

export default function NumbersPreview({ metrics, isLoading, hasError, error }) {
  const metricBlocks = metrics?.blocks ?? []

  if (isLoading && metricBlocks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        読み込み中...
      </Typography>
    )
  }

  if (hasError) {
    const errorMessage = getApiErrorDisplayMessage(error, "データの取得に失敗しました。", ERROR_MESSAGES_BY_CODE)

    return (
      <Typography variant="body2" color="text.secondary">
        {errorMessage}
      </Typography>
    )
  }

  if (metricBlocks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        データがありません。
      </Typography>
    )
  }

  return (
    <Stack spacing={3}>
      <NumbersMetricsGrid blocks={metricBlocks} />
    </Stack>
  )
}
