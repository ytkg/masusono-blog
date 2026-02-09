import SectionHeading from "@/shared/ui/SectionHeading"
import ArticlesList from "@/features/blog/ui/ArticlesList"
import PageContainer from "@/shared/ui/PageContainer"
import { usePageMeta } from "@/shared/hooks/usePageMeta"

export default function Blog() {
  usePageMeta({
    title: "ブログ",
    description: "「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。",
    canonicalPath: "/blog",
  })

  return (
    <PageContainer id="blog">
      <SectionHeading component="h1">ブログ</SectionHeading>
      <ArticlesList />
    </PageContainer>
  )
}
