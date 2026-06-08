import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

const CHART_WIDTH = 360
const CHART_HEIGHT = 220
const CHART_PADDING = { top: 18, right: 18, bottom: 36, left: 18 }
const SERIES_COLORS = ["#2563eb", "#16a34a", "#f97316"]
const MASUDA_RUN_SERIES_KEY = "masudaRunTotalPlays"
const MASUDA_RUN_SCALE = 10
const TOTAL_CHARS_SERIES_KEY = "totalChars"
const TOTAL_CHARS_SCALE = 300

function chartBounds() {
  return {
    left: CHART_PADDING.left,
    right: CHART_WIDTH - CHART_PADDING.right,
    top: CHART_PADDING.top,
    bottom: CHART_HEIGHT - CHART_PADDING.bottom,
  }
}

function normalizePoints(points, seriesKey, maxChartValue) {
  const visiblePoints = visibleSeriesPoints(points, seriesKey)
  if (visiblePoints.length === 0 || maxChartValue <= 0) return []

  const bounds = chartBounds()
  const usableWidth = bounds.right - bounds.left
  const usableHeight = bounds.bottom - bounds.top
  const denominator = Math.max(points.length - 1, 1)

  return visiblePoints
    .map(({ point, index }) => {
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

function maxChartValue(points, series) {
  return Math.max(
    ...series.flatMap(({ key }) =>
      visibleSeriesPoints(points, key)
        .map(({ point }) => scaledSeriesValue(point, key))
        .filter((value) => Number.isFinite(value)),
    ),
    0,
  )
}

function scaledSeriesValue(point, seriesKey) {
  const value = point[seriesKey]
  if (!Number.isFinite(value)) return value

  if (seriesKey === MASUDA_RUN_SERIES_KEY) return value / MASUDA_RUN_SCALE
  if (seriesKey === TOTAL_CHARS_SERIES_KEY) return value / TOTAL_CHARS_SCALE

  return value
}

function visibleSeriesPoints(points, seriesKey) {
  const indexedPoints = points.map((point, index) => ({ point, index }))
  if (seriesKey !== MASUDA_RUN_SERIES_KEY) return indexedPoints

  const firstPositiveIndex = points.findIndex((point) => point[seriesKey] > 0)
  return firstPositiveIndex >= 0 ? indexedPoints.slice(firstPositiveIndex) : []
}

function smoothPath(points) {
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

function chartDateLabels(points) {
  const bounds = chartBounds()
  const denominator = Math.max(points.length - 1, 1)
  const indexes = [0, Math.round(denominator / 3), Math.round((denominator * 2) / 3), denominator]

  return [...new Set(indexes)].map((index) => {
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

function hasTrendData(trend) {
  return (
    Array.isArray(trend?.points) && trend.points.length > 0 && Array.isArray(trend?.series) && trend.series.length > 0
  )
}

export default function NumbersTrendChart({ trend }) {
  if (!hasTrendData(trend)) return null

  const bounds = chartBounds()
  const chartMaxValue = maxChartValue(trend.points, trend.series)
  const dateLabels = chartDateLabels(trend.points)

  return (
    <Stack spacing={1.5} data-testid="numbers-trend">
      <Box>
        <Typography variant="h6" component="h2" sx={{ m: 0, fontWeight: 700 }}>
          {trend.title ?? "推移"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {trend.description ?? "各指標の累積値を日ごとに表示しています。"}
        </Typography>
      </Box>

      <Box
        sx={{
          py: 0.5,
        }}
      >
        <Box
          component="svg"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label="総記事数、総文字数、増田RUN総プレイ回数の累積推移"
          sx={{ display: "block", width: "100%", height: "auto" }}
        >
          <line x1={bounds.left} y1={bounds.bottom} x2={bounds.right} y2={bounds.bottom} stroke="#e5e7eb" />
          <line x1={bounds.left} y1={bounds.top} x2={bounds.right} y2={bounds.top} stroke="#f3f4f6" />
          <line
            x1={bounds.left}
            y1={(bounds.top + bounds.bottom) / 2}
            x2={bounds.right}
            y2={(bounds.top + bounds.bottom) / 2}
            stroke="#f3f4f6"
          />
          {dateLabels.map((dateLabel) => (
            <line
              key={`grid-${dateLabel.key}`}
              data-testid="trend-date-grid-line"
              x1={dateLabel.x}
              y1={bounds.top}
              x2={dateLabel.x}
              y2={bounds.bottom}
              stroke="#f3f4f6"
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
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth="3"
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
              fill="#6b7280"
              fontSize="11"
              textAnchor={dateLabel.textAnchor}
            >
              {dateLabel.label}
            </text>
          ))}
        </Box>

        <Stack spacing={0.75} sx={{ px: 1, pb: 0.5 }}>
          {trend.series.map((series, index) => (
            <Box
              key={series.key}
              sx={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", gap: 1 }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 18,
                  height: 3,
                  borderRadius: 999,
                  bgcolor: SERIES_COLORS[index % SERIES_COLORS.length],
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {series.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {series.finalValue ?? "—"}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Typography variant="caption" color="text.secondary">
        総文字数は1/300、増田RUN総プレイ回数は1/10で表示しています。
      </Typography>
    </Stack>
  )
}
