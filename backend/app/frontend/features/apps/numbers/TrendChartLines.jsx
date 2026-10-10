import { normalizePoints, smoothPath } from "./trendChartData"

export default function TrendChartLines({ trend, bounds, chartMaxValue, dateLabels, seriesColors, theme }) {
  return (
    <>
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
    </>
  )
}
