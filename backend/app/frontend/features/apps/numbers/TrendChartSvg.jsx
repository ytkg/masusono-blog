import { useState } from "react"
import TrendChartTooltip from "./TrendChartTooltip"
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
  const [selectedIndex, setSelectedIndex] = useState(null)
  const theme = useTheme()
  const { seriesColors } = trendSeriesStyles(theme)
  const bounds = chartBounds()
  const chartMaxValue = maxChartValue(trend.points, trend.series)
  const dateLabels = chartDateLabels(trend.points)
  const selectedPoint = trend.points[selectedIndex]
  const selectedX = bounds.left + ((bounds.right - bounds.left) * selectedIndex) / Math.max(trend.points.length - 1, 1)

  const selectPoint = (event) => {
    const rectangle = event.currentTarget.getBoundingClientRect()
    if (rectangle.width === 0) return
    const x = ((event.clientX - rectangle.left) / rectangle.width) * CHART_WIDTH
    const ratio = Math.max(0, Math.min(1, (x - bounds.left) / (bounds.right - bounds.left)))
    setSelectedIndex(Math.round(ratio * (trend.points.length - 1)))
  }

  const handleKeyDown = (event) => {
    const lastIndex = trend.points.length - 1
    const currentIndex = selectedIndex ?? lastIndex
    const indexes = {
      ArrowLeft: Math.max(0, currentIndex - 1),
      ArrowRight: Math.min(lastIndex, currentIndex + 1),
      Home: 0,
      End: lastIndex,
      Escape: null,
    }
    if (!(event.key in indexes)) return
    event.preventDefault()
    setSelectedIndex(indexes[event.key])
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="総記事数、総文字数の累積推移"
        aria-description="カーソルや指で日付を選択できます。キーボードでは左右の矢印キーで選択し、Escapeで閉じます。"
        tabIndex={0}
        onPointerDown={(event) => {
          selectPoint(event)
          if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={selectPoint}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setSelectedIndex(null)
        }}
        onPointerCancel={() => setSelectedIndex(null)}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) setSelectedIndex(trend.points.length - 1)
        }}
        onBlur={() => setSelectedIndex(null)}
        onKeyDown={handleKeyDown}
        sx={{
          display: "block",
          width: "100%",
          height: "auto",
          fontFamily: theme.typography.fontFamily,
          touchAction: "pan-y pinch-zoom",
          overflow: "visible",
          outline: "none",
          "&:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
        }}
      >
        {[0, 0.5, 1].map((ratio) => {
          const y = bounds.bottom - (bounds.bottom - bounds.top) * ratio
          return <line key={ratio} x1={bounds.left} y1={y} x2={bounds.right} y2={y} stroke={theme.palette.divider} />
        })}
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

        {selectedPoint && (
          <g aria-hidden="true" pointerEvents="none">
            <line
              data-testid="trend-selected-date"
              x1={selectedX}
              y1={bounds.top}
              x2={selectedX}
              y2={bounds.bottom}
              stroke={theme.palette.text.secondary}
              strokeDasharray="3 3"
            />
            {trend.series.map((series, index) => {
              const point = normalizePoints([selectedPoint], series.key, chartMaxValue)[0]
              if (!point) return null
              return (
                <circle
                  key={series.key}
                  cx={selectedX}
                  cy={point.y}
                  r="3"
                  fill={seriesColors[index % seriesColors.length]}
                  stroke={theme.palette.background.paper}
                  strokeWidth="1"
                />
              )
            })}
          </g>
        )}

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
      {selectedPoint && <TrendChartTooltip point={selectedPoint} series={trend.series} colors={seriesColors} />}
    </Box>
  )
}
