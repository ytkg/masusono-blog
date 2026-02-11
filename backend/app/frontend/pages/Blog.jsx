import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import ArticlesList from "../features/blog/ArticlesList"
import SeoHead from "../shared/SeoHead"

export default function Blog({ articles }) {
  return (
    <>
      <SeoHead
        title="ブログ"
        description="「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。"
        canonicalPath="/blog"
      />

      <PageContainer id="blog">
        <SectionHeading component="h1">ブログ</SectionHeading>
        <ArticlesList articles={articles} />
      </PageContainer>
    </>
  )
}
