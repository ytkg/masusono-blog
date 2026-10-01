import PageHeading from "../../shared/PageHeading"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"
import { ZukanContent } from "../../features/apps/zukan/ZukanApp"

export default function AuthorsIndex({ authors = [] }) {
  return (
    <>
      <SeoHead title="著者" description="増田とその他！の著者プロフィール一覧です。" canonicalPath="/authors" />

      <PageContainer id="authors">
        <PageHeading>著者</PageHeading>
        <ZukanContent authors={authors} />
      </PageContainer>
    </>
  )
}
