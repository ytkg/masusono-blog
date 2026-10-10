import { CHART_HEIGHT } from "./trendChartData"

export default function TrendChartDateLabels({ dateLabels, theme }) {
  return (
    <>
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
    </>
  )
}
