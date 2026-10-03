import { formatArticleStats } from "./articleStats"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ContentItemCard from "../../shared/ContentItemCard"
import ArticleActions from "./ArticleActions"
import ArticleBody from "./ArticleBody"
import ArticlePlainHeader from "./ArticlePlainHeader"
import ArticleTags from "./ArticleTags"
import { parseArticleTags } from "./parseArticleTags"

function getAuthorHref(article) {
  return article.authorId ? `/authors/${article.authorId}` : undefined
}

export default function ArticleCard({ article, mode = "list", sx }) {
  if (!article) {
    return (
      <ContentItemCard title="記事" titleComponent="h3" sx={sx}>
        <Typography color="text.secondary">記事が見つかりません。</Typography>
      </ContentItemCard>
    )
  }

  const html = article.content ?? ""
  const author = article.author ?? "不明"
  const date = article.publishedDate ?? ""
  const articleStats = formatArticleStats(article)
  const hasBody = Boolean(html.trim())
  const avatarSrc = article.authorImageUrl
  const authorHref = getAuthorHref(article)
  const isDetail = mode === "detail"
  const isList = mode === "list"
  const hasTags = parseArticleTags(article.tags).length > 0
  const action = article.id ? <ArticleActions article={article} /> : undefined
  const plainHeader = (
    <ArticlePlainHeader
      action={action}
      articleStats={articleStats}
      author={author}
      authorHref={authorHref}
      avatarSrc={avatarSrc}
      date={date}
      mode={mode}
    />
  )
  const content = (
    <ContentItemCard
      title={article.title}
      titleVariant="h6"
      titleComponent={isDetail ? "h1" : "h3"}
      titleSx={{
        fontSize: isDetail ? "24px" : "20px",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: 0,
        overflowWrap: "anywhere",
        mb: hasTags ? 0 : isDetail ? 2 : 0.5,
      }}
      titleTo={isList ? `/articles/${article.id}` : undefined}
      sx={{ minWidth: 0 }}
    >
      <ArticleTags tags={article.tags} />
      <ArticleBody enableRubyRunner={isDetail || isList} html={html} hasBody={hasBody} shouldCollapse={isList} />
    </ContentItemCard>
  )

  return (
    <Box sx={[{ display: "grid", gap: isDetail ? 2 : 1.5 }, sx]}>
      {plainHeader}
      {content}
    </Box>
  )
}
