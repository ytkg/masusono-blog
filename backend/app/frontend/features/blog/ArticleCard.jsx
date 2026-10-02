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

function formatArticleStats(article) {
  const characterCount = Number(article.characterCount)
  const readingTimeMinutes = Number(article.readingTimeMinutes)

  if (!Number.isFinite(characterCount) || characterCount <= 0) {
    return undefined
  }

  const formattedCharacterCount = new Intl.NumberFormat("ja-JP").format(characterCount)
  const formattedReadingTimeMinutes = String(readingTimeMinutes)
  const formattedReadingTime =
    Number.isFinite(readingTimeMinutes) && readingTimeMinutes > 0 ? `・約${formattedReadingTimeMinutes}分` : ""

  return `${formattedCharacterCount}字${formattedReadingTime}`
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
        fontSize: isDetail ? { xs: "38px", sm: "52px" } : { xs: "30px", sm: "36px" },
        fontWeight: 500,
        fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
        lineHeight: 1.4,
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
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: isDetail ? { xs: "1fr", md: "180px minmax(0, 1fr)" } : "1fr",
          gap: { xs: 3, md: 4 },
          bgcolor: "background.paper",
          p: { xs: 3, sm: 4 },
          borderRadius: { xs: isDetail ? 0 : "28px 28px 4px 28px", sm: "28px" },
          boxShadow: "0 10px 40px #223b9310",
          minWidth: 0,
        },
        sx,
      ]}
    >
      <Box
        sx={
          isDetail
            ? {
                alignSelf: "start",
                position: { md: "sticky" },
                top: { md: 112 },
                borderTop: "1px solid",
                pt: 2,
                "& > div": { flexDirection: { md: "column" }, alignItems: { md: "flex-start" } },
                "& [data-testid=article-detail-header]": {
                  flexDirection: { md: "column" },
                  alignItems: { md: "flex-start" },
                  gap: 3,
                },
              }
            : {
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 2,
                "& .MuiAvatar-root": { width: 32, height: 32, fontSize: 16 },
              }
        }
      >
        {plainHeader}
      </Box>
      <Box sx={{ minWidth: 0, gridRow: isDetail ? { xs: 1, md: "auto" } : 1 }}>{content}</Box>
    </Box>
  )
}
