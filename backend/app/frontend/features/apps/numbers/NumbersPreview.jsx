import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import NumbersMetricsGrid from "./NumbersMetricsGrid"
import { useMetrics } from "./useMetrics"

export default function NumbersPreview() {
  const { data, error, isLoading } = useMetrics()
  const metricBlocks = data?.blocks ?? []

  if (isLoading && !data) {
    return (
      <Typography variant="body2" color="text.secondary">
        読み込み中...
      </Typography>
    )
  }

  if (error) {
    return (
      <Typography variant="body2" color="text.secondary">
        データの取得に失敗しました。
      </Typography>
    )
  }

  return (
    <Stack spacing={3}>
      <NumbersMetricsGrid blocks={metricBlocks} />
    </Stack>
  )
}
