import TrendChartLines from "./TrendChartLines"
import TrendChartSelection from "./TrendChartSelection"
import TrendChartDateLabels from "./TrendChartDateLabels"
import { useState } from "react"
import TrendChartTooltip from "./TrendChartTooltip"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import {
  CHART_WIDTH,
  CHART_HEIGHT,
  chartBounds,
  chartPointX,
  chartPointIndex,
  maxChartValue,
  chartDateLabels,
  trendSeriesStyles,
} from "./trendChartData"

export default function TrendChartSvg({ trend }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const theme = useTheme()
  const { seriesColors } = trendSeriesStyles(theme)
  const bounds = chartBounds()
  const chartMaxValue = maxChartValue(trend.points, trend.series)
  const dateLabels = chartDateLabels(trend.points)
  const activeIndex = selectedIndex === null ? null : Math.min(selectedIndex, trend.points.length - 1)
  const selectedPoint = trend.points[activeIndex]
  const selectedX = chartPointX(activeIndex, trend.points.length)

  const selectPoint = (event) => {
    const rectangle = event.currentTarget.getBoundingClientRect()
    if (rectangle.width === 0) return
    setSelectedIndex(chartPointIndex(event.clientX, rectangle, trend.points.length))
  }

  const handleKeyDown = (event) => {
    const lastIndex = trend.points.length - 1
    const currentIndex = activeIndex ?? lastIndex
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
        <TrendChartLines
          trend={trend}
          bounds={bounds}
          chartMaxValue={chartMaxValue}
          dateLabels={dateLabels}
          seriesColors={seriesColors}
          theme={theme}
        />
        <TrendChartSelection
          trend={trend}
          selectedPoint={selectedPoint}
          selectedX={selectedX}
          bounds={bounds}
          chartMaxValue={chartMaxValue}
          seriesColors={seriesColors}
          theme={theme}
        />
        <TrendChartDateLabels dateLabels={dateLabels} theme={theme} />
      </Box>
      {selectedPoint && <TrendChartTooltip point={selectedPoint} series={trend.series} colors={seriesColors} />}
    </Box>
  )
}
