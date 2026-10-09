import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import SectionHeading from "@/shared/SectionHeading"
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
      <Stack spacing={1.5}>
        <SectionHeading>集計</SectionHeading>
        <NumbersMetricsTable rows={metricRows} />
      </Stack>
      <NumbersTrendChart trend={trend} />
    </Stack>
  )
}
