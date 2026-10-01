import TrendChartSvg from "./TrendChartSvg"
import TrendLegend from "./TrendLegend"
import { hasTrendData } from "./trendChartData"
import SectionHeading from "@/shared/SectionHeading"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

export default function NumbersTrendChart({ trend }) {
  if (!hasTrendData(trend)) return null

  return (
    <Stack spacing={1.5} data-testid="numbers-trend">
      <Box>
        <SectionHeading>{trend.title ?? "推移"}</SectionHeading>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 14 }}>
          {trend.description ?? "各指標の累積値を日ごとに表示しています。"}
        </Typography>
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
        総文字数は1/300で表示しています。
      </Typography>
    </Stack>
  )
}
