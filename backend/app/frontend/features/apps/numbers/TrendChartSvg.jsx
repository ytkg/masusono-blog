import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import {
  CHART_WIDTH,
  CHART_HEIGHT,
  chartBounds,
  maxChartValue,
  chartDateLabels,
  normalizePoints,
  smoothPath,
  trendSeriesStyles,
} from "./trendChartData"

export default function TrendChartSvg({ trend }) {
  const theme = useTheme()
  const { seriesColors } = trendSeriesStyles(theme)
  const bounds = chartBounds()
  const chartMaxValue = maxChartValue(trend.points, trend.series)
  const dateLabels = chartDateLabels(trend.points)
  return (
    <Box
      component="svg"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label="総記事数、総文字数の累積推移"
      sx={{ display: "block", width: "100%", height: "auto", fontFamily: theme.typography.fontFamily }}
    >
      <line x1={bounds.left} y1={bounds.bottom} x2={bounds.right} y2={bounds.bottom} stroke={theme.palette.divider} />
      <line x1={bounds.left} y1={bounds.top} x2={bounds.right} y2={bounds.top} stroke={theme.palette.divider} />
      <line
        x1={bounds.left}
        y1={(bounds.top + bounds.bottom) / 2}
        x2={bounds.right}
        y2={(bounds.top + bounds.bottom) / 2}
        stroke={theme.palette.divider}
      />
      {dateLabels.map((dateLabel) => (
        <line
          key={`grid-${dateLabel.key}`}
          data-testid="trend-date-grid-line"
          x1={dateLabel.x}
          y1={bounds.top}
          x2={dateLabel.x}
          y2={bounds.bottom}
          stroke={theme.palette.divider}
        />
      ))}

      {trend.series.map((series, index) => {
        const points = normalizePoints(trend.points, series.key, chartMaxValue)
        const path = smoothPath(points)
        if (!path) return null

        return (
          <path
            key={series.key}
            data-testid={`trend-line-${series.key}`}
            d={path}
            fill="none"
            stroke={seriesColors[index % seriesColors.length]}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      })}

      {dateLabels.map((dateLabel) => (
        <text
          key={dateLabel.key}
          x={dateLabel.x}
          y={CHART_HEIGHT - 12}
          fill={theme.palette.text.secondary}
          fontSize="12"
          textAnchor={dateLabel.textAnchor}
        >
          {dateLabel.label}
        </text>
      ))}
    </Box>
  )
}
