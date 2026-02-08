import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useMetrics } from "@/features/apps/numbers/hooks/useMetrics"
import ContentCardSkeletonList from "@/shared/ui/ContentCardSkeletonList"
import NumbersMetricsGrid from "./NumbersMetricsGrid"

export default function NumbersPreview() {
  const { data, error, isLoading } = useMetrics()
  const metricBlocks = data?.blocks ?? []

  if (isLoading && !data) {
    return <ContentCardSkeletonList count={2} />
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
