import PageHeading from "../../shared/components/PageHeading"
import PageContainer from "../../shared/components/PageContainer"
import SeoHead from "../../shared/components/SeoHead"
import AuthorsList from "../../features/authors/AuthorsList"

export default function AuthorsIndex({ authors = [] }) {
  return (
    <>
      <SeoHead title="著者" description="増田とその他！の著者プロフィール一覧です。" canonicalPath="/authors" />

      <PageContainer id="authors">
        <PageHeading>著者</PageHeading>
        <AuthorsList authors={authors} />
      </PageContainer>
    </>
  )
}
