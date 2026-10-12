import PageHeading from "../../shared/components/PageHeading"
import PageContainer from "../../shared/components/PageContainer"
import SeoHead from "../../shared/components/SeoHead"
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
        <PageHeading>数字でわかる、増田とその他！</PageHeading>
        <NumbersPreview metrics={metrics} />
      </PageContainer>
    </>
  )
}
