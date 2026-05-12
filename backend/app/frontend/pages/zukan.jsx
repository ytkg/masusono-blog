import Stack from "@mui/material/Stack"
import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import SeoHead from "../shared/SeoHead"
import { ZukanContent, ZukanTitleAccessory } from "../features/apps/zukan/ZukanApp"

export default function Zukan() {
  return (
    <>
      <SeoHead
        title="増その図鑑"
        description="増田とその他！のメンバーをAI分析による人物像としてまとめた図鑑ページです。"
        canonicalPath="/zukan"
      />

      <PageContainer id="zukan" sx={{ pb: 10 }}>
        <Stack spacing={1.25} sx={{ mb: 2 }}>
          <SectionHeading component="h1">増その図鑑</SectionHeading>
          <ZukanTitleAccessory />
        </Stack>
        <ZukanContent />
      </PageContainer>
    </>
  )
}
