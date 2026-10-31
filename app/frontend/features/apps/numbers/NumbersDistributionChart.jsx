import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useTheme } from "@mui/material/styles"
import SectionHeading from "@/shared/components/SectionHeading"

export default function NumbersDistributionChart({ distribution }) {
  const theme = useTheme()
  if (!distribution?.length) return null

  const total = distribution.reduce((sum, bucket) => sum + bucket.articles, 0)
  const step = Math.max(1, Math.ceil(Math.max(...distribution.map((bucket) => bucket.articles)) / 4))
  const maximum = step * 4
  const baseline = 214
  const chartHeight = 160
  const format = (value) => value.toLocaleString("ja-JP")

  return (
    <Stack spacing={1.5} sx={{ minWidth: 0 }} data-testid="numbers-distribution">
      <SectionHeading>文字数の分布</SectionHeading>
      <Typography variant="body2" color="text.secondary">
        200字ごとに集計。2,000字以上はまとめて表示。
      </Typography>
      {total === 0 ? (
        <Typography variant="body2" color="text.secondary">
          記事がありません。全区間0本です。
        </Typography>
      ) : null}
      <Box sx={{ display: "flex", minWidth: 0, maxWidth: 452 }}>
        <Box
          component="svg"
          width="56"
          height="280"
          sx={{ flexShrink: 0 }}
          aria-hidden="true"
          data-testid="distribution-axis"
        >
          <text x="4" y="18" fill={theme.palette.text.secondary} fontSize="12">
            記事数
          </text>
          <text x="4" y="34" fill={theme.palette.text.secondary} fontSize="12">
            （本）
          </text>
          {Array.from({ length: 5 }, (_, index) => {
            const value = step * index
            const y = baseline - (value / maximum) * chartHeight
            return (
              <text key={value} x="48" y={y + 4} textAnchor="end" fontSize="12" fill={theme.palette.text.secondary}>
                {format(value)}
              </text>
            )
          })}
        </Box>
        <Box
          role="region"
          aria-label="文字数の分布グラフ（左右の矢印キーでスクロール）"
          tabIndex={0}
          sx={{
            overflowX: "auto",
            minWidth: 0,
            "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
          }}
        >
          <Box
            component="svg"
            width="396"
            height="280"
            sx={{ display: "block", minWidth: 396 }}
            role="group"
            aria-label="本文文字数（字）ごとの記事数（本）"
          >
            {Array.from({ length: 5 }, (_, index) => {
              const y = baseline - (index / 4) * chartHeight
              return (
                <line key={index} x1="0" x2="396" y1={y} y2={y} stroke={theme.palette.divider} aria-hidden="true" />
              )
            })}
            {distribution.map((bucket, index) => {
              const x = 18 + index * 36
              const height = (bucket.articles / maximum) * chartHeight
              const label =
                bucket.maxChars === null
                  ? `${format(bucket.minChars)}字以上`
                  : `${format(bucket.minChars)}〜${format(bucket.maxChars)}字`
              return (
                <g key={bucket.minChars} role="img" aria-label={`${label}：${format(bucket.articles)}本`}>
                  <rect x={x - 10} y={baseline - height} width="20" height={height} fill={theme.palette.primary.main} />
                  <text
                    x={x}
                    y={baseline - height - 9}
                    textAnchor="middle"
                    fontSize="13"
                    fill={theme.palette.text.primary}
                  >
                    {format(bucket.articles)}本
                  </text>
                  <text x={x} y="232" textAnchor="middle" fontSize="12" fill={theme.palette.text.secondary}>
                    <tspan x={x}>{format(bucket.minChars)}</tspan>
                    <tspan x={x} dy="14">
                      {bucket.maxChars === null ? "以上" : "〜"}
                    </tspan>
                    {bucket.maxChars !== null ? (
                      <tspan x={x} dy="14">
                        {format(bucket.maxChars)}
                      </tspan>
                    ) : null}
                  </text>
                </g>
              )
            })}
          </Box>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", maxWidth: 452 }}>
        本文文字数（字）
      </Typography>
    </Stack>
  )
}
