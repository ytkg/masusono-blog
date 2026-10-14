import TrendChartSvg from "./TrendChartSvg"
import TrendLegend from "./TrendLegend"
import { hasTrendData } from "./trendChartData"
import SectionHeading from "@/shared/components/SectionHeading"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

export default function NumbersTrendChart({ trend }) {
  if (!hasTrendData(trend)) return null

  return (
    <Stack spacing={1.5} data-testid="numbers-trend">
      <Box>
        <SectionHeading>{trend.title ?? "推移"}</SectionHeading>
      </Box>

      <Box
        sx={{
          py: 0.5,
        }}
      >
        <TrendChartSvg trend={trend} />
        <TrendLegend series={trend.series} />
      </Box>

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        総文字数は1/300
      </Typography>
    </Stack>
  )
}
