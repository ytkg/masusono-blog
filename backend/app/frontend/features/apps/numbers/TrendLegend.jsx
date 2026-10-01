import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useTheme } from "@mui/material/styles"
import { trendSeriesStyles } from "./trendChartData"

export default function TrendLegend({ series }) {
  const theme = useTheme()
  const { seriesColors, seriesDasharray } = trendSeriesStyles(theme)
  return (
    <Stack spacing={0.75} sx={{ px: 1, pb: 0.5 }}>
      {series.map((series, index) => (
        <Box
          key={series.key}
          sx={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", gap: 1 }}
        >
          <Box component="svg" aria-hidden="true" viewBox="0 0 24 6" sx={{ width: 24, height: 6 }}>
            <line
              x1="2"
              y1="3"
              x2="22"
              y2="3"
              stroke={seriesColors[index % seriesColors.length]}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={seriesDasharray(series.key)}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 14 }}>
            {series.label}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 14, fontWeight: 700 }}>
            {series.finalValue ?? "—"}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}
