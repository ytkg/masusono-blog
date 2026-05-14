import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
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

      <PageContainer id="numbers" sx={{ pb: 10 }}>
        <SectionHeading component="h1">数字でわかる、増田とその他！</SectionHeading>
        <NumbersPreview metrics={metrics} />
      </PageContainer>
    </>
  )
}
