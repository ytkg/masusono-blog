import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ContentItemCard from "../../shared/ContentItemCard"
import ArticleActions from "./ArticleActions"
import ArticleBody from "./ArticleBody"
import ArticlePlainHeader from "./ArticlePlainHeader"
import ArticleTags from "./ArticleTags"

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

export default function ArticleCard({ article, mode = "list", presentation = "card", sx }) {
  if (!article) {
    return (
      <ContentItemCard title="記事" titleComponent="h3" presentation={presentation} sx={sx}>
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
  const isPlain = presentation === "plain"
  const isDetailPlain = isPlain && mode === "detail"
  const isListPlain = isPlain && mode === "list"
  const shouldCollapseBody = isListPlain
  const action = article.id ? <ArticleActions article={article} /> : undefined
  const plainHeader = isPlain ? (
    <ArticlePlainHeader
      action={action}
      articleStats={articleStats}
      author={author}
      authorHref={authorHref}
      avatarSrc={avatarSrc}
      date={date}
      mode={mode}
    />
  ) : undefined
  const content = (
    <ContentItemCard
      title={article.title}
      titleVariant="h6"
      titleComponent={mode === "detail" ? "h1" : "h3"}
      titleTo={mode === "list" ? `/articles/${article.id}` : undefined}
      meta={undefined}
      metaParts={isPlain ? undefined : [author, [date, articleStats].filter(Boolean).join(" ・ ")]}
      metaPlacement={isListPlain ? "above" : "below"}
      action={isPlain ? undefined : action}
      presentation={presentation}
      sx={isPlain ? { minWidth: 0 } : sx}
    >
      <ArticleTags tags={article.tags} />
      <ArticleBody
        enableRubyRunner={mode === "detail" || isListPlain}
        html={html}
        hasBody={hasBody}
        shouldCollapse={shouldCollapseBody}
      />
    </ContentItemCard>
  )

  if (isDetailPlain) {
    return (
      <Box sx={[{ display: "grid", gap: 2 }, sx]}>
        {plainHeader}
        {content}
      </Box>
    )
  }

  if (isPlain) {
    return (
      <Box sx={[{ display: "grid", gap: 1.5 }, sx]}>
        {plainHeader}
        {content}
      </Box>
    )
  }

  return content
}
