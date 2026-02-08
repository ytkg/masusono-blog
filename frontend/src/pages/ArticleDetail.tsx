import { Navigate, useLocation, useParams, Link as RouterLink } from "react-router-dom"
import PageContainer from "@/shared/ui/PageContainer"
import ArticleCard from "@/components/ArticleCard"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import type { Article } from "@/types/article"
import { useArticle } from "@/hooks/useArticle"
import { usePageMeta } from "@/hooks/usePageMeta"

type LocationState = {
  article?: Article
}

export default function ArticleDetail() {
  const { articleId } = useParams<{ articleId: string }>()
  const location = useLocation()
  const state = location.state as LocationState | undefined

  const { data, error, isLoading } = useArticle(articleId, state?.article)
  const article = data ?? state?.article ?? null
  const textContent = article?.content ?? ""
  const plainText =
    typeof textContent === "string"
      ? textContent
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim()
      : ""
  const metaDescription = plainText ? plainText.slice(0, 120) + (plainText.length > 120 ? "…" : "") : undefined

  usePageMeta({
    title: article?.title ?? "ブログ記事",
    description: metaDescription,
    canonicalPath: articleId ? `/blog/${articleId}` : undefined,
  })

  if (!articleId) {
    return <Navigate to="/blog" replace />
  }

  return (
    <PageContainer component="article">
      <Typography variant="h5" component="h2" gutterBottom>
        ブログ
      </Typography>
      <ArticleCard article={article ?? undefined} mode="detail" loading={isLoading} error={error} />
      <Link
        component={RouterLink}
        to="/blog"
        color="inherit"
        underline="hover"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 3 }}
      >
        <ArrowBackIcon fontSize="small" />
        記事一覧に戻る
      </Link>
    </PageContainer>
  )
}
