import { Link } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MuiLink from "@mui/material/Link"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
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

export default function BlogDetail({ article = null }) {
  const metaDescription = extractMetaDescription(article?.content)
  const canonical = article?.id ? `/blog/${article.id}` : "/blog"

  return (
    <>
      <SeoHead title={article?.title ?? "ブログ記事"} description={metaDescription} canonicalPath={canonical} />

      <PageContainer component="article">
        <SectionHeading component="h2">ブログ</SectionHeading>
        <ArticleCard article={article ?? undefined} mode="detail" />
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
