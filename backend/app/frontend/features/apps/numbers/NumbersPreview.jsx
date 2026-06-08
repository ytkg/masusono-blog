import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import NumbersMetricsGrid from "./NumbersMetricsGrid"
import NumbersTrendChart from "./NumbersTrendChart"

export default function NumbersPreview({ metrics }) {
  const metricBlocks = metrics?.blocks ?? []
  const trend = metrics?.trend

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
      <NumbersTrendChart trend={trend} />
    </Stack>
  )
}
