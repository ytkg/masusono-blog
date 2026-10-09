import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import NumbersMetricsTable from "./NumbersMetricsTable"
import NumbersTrendChart from "./NumbersTrendChart"

export default function NumbersPreview({ metrics }) {
  const metricRows = metrics?.rows ?? []
  const trend = metrics?.trend

  if (metricRows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        データがありません。
      </Typography>
    )
  }

  return (
    <Stack spacing={3}>
      <NumbersMetricsTable rows={metricRows} />
      <NumbersTrendChart trend={trend} />
    </Stack>
  )
}
