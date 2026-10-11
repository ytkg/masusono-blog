import { chartPointX } from "./trendChartGeometry"

export {
  CHART_WIDTH,
  CHART_HEIGHT,
  chartBounds,
  chartPointX,
  chartPointIndex,
  normalizePoints,
  maxChartValue,
} from "./trendChartGeometry"
export { smoothPath } from "./trendChartPath"

export function chartDateLabels(points) {
  if (points.length === 0) return []
  const lastIndex = points.length - 1
  const denominator = Math.max(lastIndex, 1)

  return dateLabelIndexes(lastIndex).map((index) => {
    const point = points[index]
    return {
      key: point.date,
      label: shortDateLabel(point.label ?? point.date),
      x: chartPointX(index, points.length),
      textAnchor: index === 0 ? "start" : index === denominator ? "end" : "middle",
    }
  })
}

function shortDateLabel(label) {
  return String(label).replace(/^(\d{2})(\d{2})\//, "'$2/")
}

export function hasTrendData(trend) {
  return (
    Array.isArray(trend?.points) && trend.points.length > 0 && Array.isArray(trend?.series) && trend.series.length > 0
  )
}

export function trendSeriesStyles(theme) {
  return {
    seriesColors: [theme.palette.dataVisualization.totalArticles, theme.palette.dataVisualization.totalChars],
  }
}

function dateLabelIndexes(lastIndex) {
  const indexes = [0, Math.round(lastIndex / 3), Math.round((lastIndex * 2) / 3), lastIndex]
  return [...new Set(indexes)]
}
