import { truncateText } from "../../shared/lib/truncateText"
import { extractTextFromHtml } from "../../features/blog/articleHtmlText"
import PageContainer from "../../shared/components/PageContainer"
import ArticleCard from "../../features/blog/ArticleCard"
import SeoHead from "../../shared/components/SeoHead"

function extractMetaDescription(content) {
  const plainText = extractTextFromHtml(content)

  return plainText ? `${truncateText(plainText, 120)}${plainText.length > 120 ? "…" : ""}` : undefined
}

export default function BlogDetail({ article = null, relatedArticles = [], yearAgoArticles = [], ogpImagePath }) {
  const metaDescription = extractMetaDescription(article?.content)
  const canonical = article?.id ? `/articles/${article.id}` : "/"

  return (
    <>
      <SeoHead
        title={article?.title ?? "ブログ記事"}
        description={metaDescription}
        canonicalPath={canonical}
        imagePath={ogpImagePath}
        imageAlt={`増田とその他！：${article?.title ?? "ブログ記事"}`}
      />

      <PageContainer component="article">
        <ArticleCard
          article={article ?? undefined}
          mode="detail"
          relatedArticles={relatedArticles}
          yearAgoArticles={yearAgoArticles}
        />
      </PageContainer>
    </>
  )
}
