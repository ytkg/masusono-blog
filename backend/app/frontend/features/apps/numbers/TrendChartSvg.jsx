import { TOTAL_CHARS_SCALE } from "./trendChartGeometry"
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
      {[0, 0.5, 1].map((ratio) => {
        const y = bounds.bottom - (bounds.bottom - bounds.top) * ratio
        const value = chartMaxValue * ratio
        const formatValue = (number) =>
          number >= 10000
            ? `${new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(number / 10000)}万`
            : new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 }).format(number)
        return (
          <g key={ratio}>
            <line x1={bounds.left} y1={y} x2={bounds.right} y2={y} stroke={theme.palette.divider} />
            <text x={bounds.left - 6} y={y} dy="0.35em" textAnchor="end" fill={seriesColors[0]} fontSize="11">
              {formatValue(value)}
            </text>
            <text x={bounds.right + 6} y={y} dy="0.35em" textAnchor="start" fill={seriesColors[1]} fontSize="11">
              {formatValue(value * TOTAL_CHARS_SCALE)}
            </text>
          </g>
        )
      })}
      <text x={bounds.left - 6} y="9" textAnchor="end" fill={seriesColors[0]} fontSize="10">
        本
      </text>
      <text x={bounds.right + 6} y="9" textAnchor="start" fill={seriesColors[1]} fontSize="10">
        字
      </text>
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
            strokeWidth="2"
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
