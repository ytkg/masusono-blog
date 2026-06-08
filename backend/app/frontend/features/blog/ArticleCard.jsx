import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"
import ContentItemCard from "../../shared/ContentItemCard"
import ArticleActions from "./ArticleActions"
import ArticleAuthorAvatar from "./ArticleAuthorAvatar"
import ArticleBody from "./ArticleBody"

function getAuthorHref(article) {
  return article.authorId ? `/authors/${article.authorId}` : undefined
}

function normalizeTags(tags) {
  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

function ArticleTags({ tags }) {
  const normalizedTags = normalizeTags(tags)

  if (!normalizedTags.length) {
    return null
  }

  return (
    <Box data-testid="article-tags" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
      {normalizedTags.map((tag) => (
        <Chip
          key={tag}
          component={Link}
          href={`/search?q=${encodeURIComponent(`#${tag}`)}`}
          label={`#${tag}`}
          size="small"
          variant="outlined"
          clickable
        />
      ))}
    </Box>
  )
}

function formatArticleStats(article) {
  const characterCount = Number(article.characterCount)
  const readingTimeMinutes = Number(article.readingTimeMinutes)

  if (!Number.isFinite(characterCount) || characterCount <= 0) {
    return undefined
  }

  const formattedCharacterCount = new Intl.NumberFormat("ja-JP").format(characterCount)
  const formattedReadingTime =
    Number.isFinite(readingTimeMinutes) && readingTimeMinutes > 0 ? `・約${readingTimeMinutes}分` : ""

  return `${formattedCharacterCount}字${formattedReadingTime}`
}

function ArticleMetaText({ articleStats, author, authorHref, date, mode = "list" }) {
  const AuthorComponent = (
    <Box
      component={authorHref ? Link : "span"}
      href={authorHref}
      data-testid={mode === "detail" ? "article-detail-author" : "article-meta-author"}
      sx={{
        color: "text.primary",
        fontWeight: 700,
        lineHeight: 1.35,
        textDecoration: "none",
        "&:hover": authorHref ? { textDecoration: "underline" } : undefined,
      }}
    >
      {author}
    </Box>
  )
  const secondaryParts = [date, articleStats].filter(Boolean)

  return (
    <Box
      data-testid={mode === "detail" ? "article-detail-meta" : "article-list-meta-text"}
      sx={{ minWidth: 0, display: "grid", gap: 0.25 }}
    >
      {AuthorComponent}
      {secondaryParts.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ m: 0, lineHeight: 1.45 }}>
          {secondaryParts.join(" ・ ")}
        </Typography>
      ) : null}
    </Box>
  )
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
  const meta = isListPlain ? (
    <Box
      data-testid="article-list-meta"
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, width: "100%" }}
    >
      <ArticleMetaText articleStats={articleStats} author={author} authorHref={authorHref} date={date} />
      <Box sx={{ flex: "0 0 auto", ml: 1 }}>
        {action}
      </Box>
    </Box>
  ) : undefined
  const content = (
    <ContentItemCard
      title={article.title}
      titleVariant="h6"
      titleComponent={mode === "detail" ? "h1" : "h3"}
      titleTo={mode === "list" ? `/articles/${article.id}` : undefined}
      meta={isListPlain ? undefined : meta}
      metaParts={isPlain ? undefined : [author, [date, articleStats].filter(Boolean).join(" ・ ")]}
      metaPlacement={isListPlain ? "above" : "below"}
      action={isPlain ? undefined : action}
      presentation={presentation}
      sx={isPlain ? { minWidth: 0 } : sx}
    >
      <ArticleTags tags={article.tags} />
      <ArticleBody html={html} hasBody={hasBody} shouldCollapse={shouldCollapseBody} />
    </ContentItemCard>
  )

  if (isDetailPlain) {
    return (
      <Box sx={[{ display: "grid", gap: 2 }, sx]}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <ArticleAuthorAvatar
            author={author}
            authorHref={authorHref}
            avatarSrc={avatarSrc}
            sx={{
              flex: "0 0 auto",
            }}
          />
          <Box
            data-testid="article-detail-header"
            sx={{
              minWidth: 0,
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box
              sx={{ minWidth: 0 }}
            >
              <ArticleMetaText
                articleStats={articleStats}
                author={author}
                authorHref={authorHref}
                date={date}
                mode="detail"
              />
            </Box>
            <Box sx={{ flex: "0 0 auto" }}>{action}</Box>
          </Box>
        </Box>
        {content}
      </Box>
    )
  }

  if (isPlain) {
    return (
      <Box sx={[{ display: "grid", gap: 1.5 }, sx]}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <ArticleAuthorAvatar
            author={author}
            authorHref={authorHref}
            avatarSrc={avatarSrc}
            sx={{
              flex: "0 0 auto",
            }}
          />
          {meta}
        </Box>
        {content}
      </Box>
    )
  }

  return content
}
