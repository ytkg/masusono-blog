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
  const baseline = 244
  const chartHeight = 184
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
      <Box
        role="region"
        aria-label="文字数の分布グラフ（左右の矢印キーでスクロール）"
        tabIndex={0}
        sx={{
          overflowX: "auto",
          maxWidth: "100%",
          "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 1100 320"
          sx={{ display: "block", width: "100%", minWidth: 1000 }}
          role="group"
          aria-label="本文文字数（字）ごとの記事数（本）"
        >
          <text x="8" y="20" fill={theme.palette.text.secondary} fontSize="13">
            記事数（本）
          </text>
          {Array.from({ length: 5 }, (_, index) => {
            const value = step * index
            const y = baseline - (value / maximum) * chartHeight
            return (
              <g key={value} aria-hidden="true">
                <line x1="58" x2="1090" y1={y} y2={y} stroke={theme.palette.divider} />
                <text x="48" y={y + 4} textAnchor="end" fontSize="12" fill={theme.palette.text.secondary}>
                  {format(value)}
                </text>
              </g>
            )
          })}
          {distribution.map((bucket, index) => {
            const x = 105 + index * 94
            const height = (bucket.articles / maximum) * chartHeight
            const label =
              bucket.maxChars === null
                ? `${format(bucket.minChars)}字以上`
                : `${format(bucket.minChars)}〜${format(bucket.maxChars)}字`
            return (
              <g key={bucket.minChars} role="img" aria-label={`${label}：${format(bucket.articles)}本`}>
                <rect x={x - 25} y={baseline - height} width="50" height={height} fill={theme.palette.primary.main} />
                <text
                  x={x}
                  y={baseline - height - 9}
                  textAnchor="middle"
                  fontSize="13"
                  fill={theme.palette.text.primary}
                >
                  {format(bucket.articles)}本
                </text>
                <text x={x} y="270" textAnchor="middle" fontSize="12" fill={theme.palette.text.secondary}>
                  {label.replace("字", "")}
                </text>
              </g>
            )
          })}
          <text x="580" y="308" textAnchor="middle" fontSize="13" fill={theme.palette.text.secondary}>
            本文文字数（字）
          </text>
        </Box>
      </Box>
    </Stack>
  )
}
