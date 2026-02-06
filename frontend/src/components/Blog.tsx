import Typography from "@mui/material/Typography"
import ArticlesList from "./ArticlesList"
import PageContainer from "./PageContainer"
import { usePageMeta } from "../hooks/usePageMeta"

export default function Blog() {
  usePageMeta({
    title: "ブログ",
    description: "「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。",
    canonicalPath: "/blog",
  })

  return (
    <PageContainer id="blog">
      <Typography variant="h5" component="h1" gutterBottom>
        ブログ
      </Typography>
      <ArticlesList />
    </PageContainer>
  )
}
