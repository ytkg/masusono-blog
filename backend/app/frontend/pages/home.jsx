import { useEffect } from "react"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import ArticlesList from "../features/blog/ArticlesList"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

export default function Home({ articles = [] }) {
  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  return (
    <>
      <SeoHead
        title="ホーム"
        description="「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。"
        canonicalPath="/"
      />
      <PageContainer id="home">
        <ArticlesList articles={articles} variant="divided" />
      </PageContainer>
    </>
  )
}
