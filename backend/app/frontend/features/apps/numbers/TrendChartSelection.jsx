import { normalizePoints } from "./trendChartData"

export default function TrendChartSelection({
  trend,
  selectedPoint,
  selectedX,
  bounds,
  chartMaxValue,
  seriesColors,
  theme,
}) {
  return (
    <>
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
    </>
  )
}
