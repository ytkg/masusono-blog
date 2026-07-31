import { Head, Link } from "@inertiajs/react"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { requestHomeFeed } from "@/shared/lib/homeNavigation"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"

const SITE_TITLE = "増田とその他！"

export default function NotFound() {
  return (
    <>
      <Head>
        <title>{`404 Not Found | ${SITE_TITLE}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <PageContainer component="article">
        <SectionHeading component="h1">ページが見つかりません</SectionHeading>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          指定されたURLは存在しないか、削除された可能性があります。
        </Typography>
        <MuiLink component={Link} href="/" prefetch color="inherit" underline="hover" onClick={requestHomeFeed}>
          ホームに戻る
        </MuiLink>
      </PageContainer>
    </>
  )
}
