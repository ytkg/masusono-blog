import { Link } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import ArticleCard from "../features/blog/ArticleCard"
import useArticle from "../features/blog/hooks/useArticle"
import useCurrentPathSegmentId from "../shared/hooks/useCurrentPathSegmentId"
import SeoHead from "../shared/SeoHead"

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

export default function BlogDetail() {
  const resolvedArticleId = useCurrentPathSegmentId()
  const { article, error, isLoading } = useArticle(resolvedArticleId)

  const metaDescription = extractMetaDescription(article?.content)
  const canonical = article?.id ? `/blog/${article.id}` : `/blog/${resolvedArticleId}`

  return (
    <>
      <SeoHead title={article?.title ?? "ブログ記事"} description={metaDescription} canonicalPath={canonical} />

      <PageContainer component="article">
        <SectionHeading component="h2">ブログ</SectionHeading>
        {isLoading ? (
          <Typography color="text.secondary">記事を読み込み中です。</Typography>
        ) : error ? (
          <Typography color="error.main">記事の取得に失敗しました。時間を置いて再度お試しください。</Typography>
        ) : (
          <ArticleCard article={article ?? undefined} mode="detail" />
        )}
        <MuiLink
          component={Link}
          href="/blog"
          prefetch
          color="inherit"
          underline="hover"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 3 }}
        >
          <ArrowBackIcon fontSize="small" />
          記事一覧に戻る
        </MuiLink>
      </PageContainer>
    </>
  )
}
