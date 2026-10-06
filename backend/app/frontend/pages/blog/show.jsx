import PageContainer from "../../shared/PageContainer"
import ArticleCard from "../../features/blog/ArticleCard"
import SeoHead from "../../shared/SeoHead"

function extractMetaDescription(content) {
  const plainText =
    typeof content === "string"
      ? content
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : ""

  return plainText ? `${plainText.slice(0, 120)}${plainText.length > 120 ? "…" : ""}` : undefined
}

export default function BlogDetail({ article = null, relatedArticles = [] }) {
  const metaDescription = extractMetaDescription(article?.content)
  const canonical = article?.id ? `/articles/${article.id}` : "/"

  return (
    <>
      <SeoHead title={article?.title ?? "ブログ記事"} description={metaDescription} canonicalPath={canonical} />

      <PageContainer component="article">
        <ArticleCard article={article ?? undefined} mode="detail" relatedArticles={relatedArticles} />
      </PageContainer>
    </>
  )
}
