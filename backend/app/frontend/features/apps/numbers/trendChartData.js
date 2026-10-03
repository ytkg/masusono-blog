export const CHART_WIDTH = 360
export const CHART_HEIGHT = 220
const CHART_PADDING = Object.freeze({ top: 18, right: 18, bottom: 36, left: 18 })
const TOTAL_CHARS_SERIES_KEY = "totalChars"
const TOTAL_CHARS_SCALE = 300

export function chartBounds() {
  return {
    left: CHART_PADDING.left,
    right: CHART_WIDTH - CHART_PADDING.right,
    top: CHART_PADDING.top,
    bottom: CHART_HEIGHT - CHART_PADDING.bottom,
  }
}

export function normalizePoints(points, seriesKey, maxChartValue) {
  if (points.length === 0 || maxChartValue <= 0) return []

  const bounds = chartBounds()
  const usableWidth = bounds.right - bounds.left
  const usableHeight = bounds.bottom - bounds.top
  const denominator = Math.max(points.length - 1, 1)

  return points
    .map((point, index) => {
      const value = scaledSeriesValue(point, seriesKey)
      if (!Number.isFinite(value)) return null

      const ratio = value / maxChartValue
      return {
        x: bounds.left + (usableWidth * index) / denominator,
        y: bounds.bottom - usableHeight * ratio,
      }
    })
    .filter(Boolean)
}

export function maxChartValue(points, series) {
  let maximum = 0
  for (const { key } of series) {
    for (const point of points) {
      const value = scaledSeriesValue(point, key)
      if (Number.isFinite(value)) maximum = Math.max(maximum, value)
    }
  }
  return maximum
}

function scaledSeriesValue(point, seriesKey) {
  const value = point[seriesKey]
  if (!Number.isFinite(value)) return value

  if (seriesKey === TOTAL_CHARS_SERIES_KEY) return value / TOTAL_CHARS_SCALE

  return value
}

export function smoothPath(points) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  const [first, second, ...rest] = points
  const firstMidpoint = midpoint(first, second)
  const commands = [`M ${first.x} ${first.y}`, `Q ${first.x} ${first.y} ${firstMidpoint.x} ${firstMidpoint.y}`]
  let previous = second

  rest.forEach((point) => {
    const nextMidpoint = midpoint(previous, point)
    commands.push(`T ${nextMidpoint.x} ${nextMidpoint.y}`)
    previous = point
  })
  commands.push(`T ${previous.x} ${previous.y}`)

  return commands.join(" ")
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }
}

export function chartDateLabels(points) {
  const bounds = chartBounds()
  if (points.length === 0) return []
  const lastIndex = points.length - 1
  const denominator = Math.max(lastIndex, 1)

  return dateLabelIndexes(lastIndex).map((index) => {
    const point = points[index]
    return {
      key: point.date,
      label: shortDateLabel(point.label ?? point.date),
      x: bounds.left + ((bounds.right - bounds.left) * index) / denominator,
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
