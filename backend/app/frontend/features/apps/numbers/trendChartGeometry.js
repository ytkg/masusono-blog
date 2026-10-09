export const CHART_WIDTH = 360
export const CHART_HEIGHT = 220
const CHART_PADDING = Object.freeze({ top: 18, right: 2, bottom: 36, left: 2 })
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
