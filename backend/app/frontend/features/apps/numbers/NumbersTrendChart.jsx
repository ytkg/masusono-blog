import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

const CHART_WIDTH = 360
const CHART_HEIGHT = 220
const CHART_PADDING = { top: 18, right: 18, bottom: 36, left: 18 }
const SERIES_COLORS = ["#2563eb", "#16a34a", "#f97316"]

function chartBounds() {
  return {
    left: CHART_PADDING.left,
    right: CHART_WIDTH - CHART_PADDING.right,
    top: CHART_PADDING.top,
    bottom: CHART_HEIGHT - CHART_PADDING.bottom,
  }
}

function normalizePoints(points, seriesKey) {
  const values = points.map((point) => point[seriesKey]).filter((value) => Number.isFinite(value))
  const maxValue = Math.max(...values, 0)
  if (values.length === 0) return []

  const bounds = chartBounds()
  const usableWidth = bounds.right - bounds.left
  const usableHeight = bounds.bottom - bounds.top
  const denominator = Math.max(points.length - 1, 1)

  return points
    .map((point, index) => {
      const value = point[seriesKey]
      if (!Number.isFinite(value)) return null

      const ratio = maxValue > 0 ? value / maxValue : 0
      return {
        x: bounds.left + (usableWidth * index) / denominator,
        y: bounds.bottom - usableHeight * ratio,
      }
    })
    .filter(Boolean)
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

function hasTrendData(trend) {
  return (
    Array.isArray(trend?.points) && trend.points.length > 0 && Array.isArray(trend?.series) && trend.series.length > 0
  )
}

export default function NumbersTrendChart({ trend }) {
  if (!hasTrendData(trend)) return null

  const bounds = chartBounds()
  const startLabel = trend.points[0]?.label
  const endLabel = trend.points.at(-1)?.label

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
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          px: 1,
          py: 1.25,
          bgcolor: "background.paper",
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

          {trend.series.map((series, index) => {
            const points = normalizePoints(trend.points, series.key)
            const path = smoothPath(points)
            if (!path) return null

            return (
              <path
                key={series.key}
                d={path}
                fill="none"
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}

          <text x={bounds.left} y={CHART_HEIGHT - 12} fill="#6b7280" fontSize="11">
            {startLabel}
          </text>
          <text x={bounds.right} y={CHART_HEIGHT - 12} fill="#6b7280" fontSize="11" textAnchor="end">
            {endLabel}
          </text>
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
        線は各指標の最大値に合わせて表示しています。
      </Typography>
    </Stack>
  )
}
