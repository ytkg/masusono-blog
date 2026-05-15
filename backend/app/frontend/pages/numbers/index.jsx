import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"
import NumbersPreview from "../../features/apps/numbers/NumbersPreview"

export default function NumbersIndex({ metrics }) {
  return (
    <>
      <SeoHead
        title="数字でわかる、増田とその他！"
        description="増田とその他！の記事やアプリの利用状況を数字でまとめたページです。"
        canonicalPath="/numbers"
      />

      <PageContainer id="numbers">
        <Stack spacing={1.5}>
          <Typography variant="h5" component="h1" sx={{ m: 0, fontWeight: 700, lineHeight: 1.25 }}>
            数字でわかる、増田とその他！
          </Typography>
          <NumbersPreview metrics={metrics} />
        </Stack>
      </PageContainer>
    </>
  )
}
