import { Head } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import NumbersTrendChart from "../../features/apps/numbers/NumbersTrendChart"
import NumbersMetricsTable from "../../features/apps/numbers/NumbersMetricsTable"

export default function DashboardHome({ metrics }) {
  const rows = metrics?.rows ?? []
  const total = rows[0]
  const cards = [
    { label: "公開記事", value: total?.articles },
    { label: "総文字数", value: total?.chars },
    { label: "1記事あたり", value: total?.averageChars },
  ]

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f4f6f8", color: "#182b38" }}>
      <Head>
        <title>Dashboard | 増田とその他！</title>
        <meta name="description" content="増田とその他！の公開記事と執筆の推移をまとめたダッシュボード。" />
        <link rel="canonical" href="https://dashboard.masusono.com/" />
      </Head>
      <Box component="header" sx={{ bgcolor: "#182b38", color: "white", px: { xs: 2, sm: 4 }, py: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography sx={{ fontWeight: 700 }}>増田とその他！ / Dashboard</Typography>
          <Link href="https://masusono.com/" color="inherit" sx={{ fontSize: 14, flexShrink: 0 }}>
            ブログを見る ↗
          </Link>
        </Stack>
      </Box>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" sx={{ color: "#397c73", letterSpacing: 3 }}>
              OVERVIEW
            </Typography>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: 28, sm: 36 } }}>
              記事のある毎日を、数字で。
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              公開記事の集計と、これまでの積み重ねをひと目で確認できます。
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
            {cards.map(({ label, value }) => (
              <Paper key={label} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 700, mt: 1, fontVariantNumeric: "tabular-nums" }}>
                  {value ?? "—"}
                </Typography>
              </Paper>
            ))}
          </Box>
          {total ? (
            <>
              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                <NumbersTrendChart trend={metrics.trend} />
              </Paper>
              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  著者別の集計
                </Typography>
                <NumbersMetricsTable rows={rows} />
              </Paper>
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography>まだ集計データがありません。</Typography>
            </Paper>
          )}
          <Typography component="footer" variant="caption" color="text.secondary">
            公開記事のみを集計しています。集計結果は最大1時間キャッシュされます。
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

DashboardHome.layout = (page) => page
