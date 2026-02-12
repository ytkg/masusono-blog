import Typography from "@mui/material/Typography"
import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import ArticlesList from "../features/blog/ArticlesList"
import useArticles from "../features/blog/hooks/useArticles"
import SeoHead from "../shared/SeoHead"

export default function Blog() {
  const { articles, error, isLoading } = useArticles()

  return (
    <>
      <SeoHead
        title="ブログ"
        description="「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。"
        canonicalPath="/blog"
      />

      <PageContainer id="blog">
        <SectionHeading component="h1">ブログ</SectionHeading>
        {isLoading ? (
          <Typography color="text.secondary">記事を読み込み中です。</Typography>
        ) : error ? (
          <Typography color="error.main">記事の取得に失敗しました。時間を置いて再度お試しください。</Typography>
        ) : (
          <ArticlesList articles={articles} />
        )}
      </PageContainer>
    </>
  )
}
