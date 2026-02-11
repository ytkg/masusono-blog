import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import NumbersMetricsGrid from "./NumbersMetricsGrid"

export default function NumbersPreview({ metrics, isLoading, hasError }) {
  const metricBlocks = metrics?.blocks ?? []

  if (isLoading && metricBlocks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        読み込み中...
      </Typography>
    )
  }

  if (hasError) {
    return (
      <Typography variant="body2" color="text.secondary">
        データの取得に失敗しました。
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
