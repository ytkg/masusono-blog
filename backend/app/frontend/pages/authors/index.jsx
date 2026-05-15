import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"
import { ZukanContent } from "../../features/apps/zukan/ZukanApp"

export default function AuthorsIndex({ authors = [] }) {
  return (
    <>
      <SeoHead title="著者" description="増田とその他！の著者プロフィール一覧です。" canonicalPath="/authors" />

      <PageContainer id="authors">
        <Stack spacing={1.5}>
          <Typography variant="h5" component="h1" sx={{ m: 0, fontWeight: 700, lineHeight: 1.25 }}>
            著者
          </Typography>
          <ZukanContent authors={authors} />
        </Stack>
      </PageContainer>
    </>
  )
}
