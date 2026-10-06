import { trackRelatedArticleClick } from "../../shared/lib/analytics"
import { formatArticleStats } from "./articleStats"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import ContentItemCard from "../../shared/ContentItemCard"
import ArticleActions from "./ArticleActions"
import ArticleBody from "./ArticleBody"
import ArticlePlainHeader from "./ArticlePlainHeader"
import ArticleTags from "./ArticleTags"
import { parseArticleTags } from "./parseArticleTags"

function getAuthorHref(article) {
  return article.authorId ? `/authors/${article.authorId}` : undefined
}

export default function ArticleCard({ article, mode = "list", sx, relatedArticles = [] }) {
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
      {isDetail && relatedArticles.length > 0 && (
        <Box component="section" aria-label="関連記事" sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
            関連記事
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3, display: "grid", gap: 1.5 }}>
            {relatedArticles.map((related, index) => (
              <Box component="li" key={related.id} sx={{ overflowWrap: "anywhere" }}>
                <Link
                  href={`/articles/${related.id}`}
                  underline="always"
                  color="inherit"
                  onClick={() => trackRelatedArticleClick(article.id, related.id, index + 1)}
                  onAuxClick={(event) => {
                    if (event.button === 1) trackRelatedArticleClick(article.id, related.id, index + 1)
                  }}
                >
                  {related.title}
                </Link>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {isDetail && (
        <Box sx={{ mt: 3 }}>
          <Link
            href="https://diary.blogmura.com/ranking/in?p_cid=11218704"
            target="_blank"
            rel="noopener"
            sx={{ display: "inline-block" }}
          >
            <Box
              component="img"
              src="https://b.blogmura.com/diary/88_31.gif"
              width="88"
              height="31"
              alt="にほんブログ村 その他日記ブログへ"
              sx={{ display: "block", border: 0 }}
            />
          </Link>
        </Box>
      )}
    </ContentItemCard>
  )

  return (
    <Box sx={[{ display: "grid", gap: isDetail ? 2 : 1.5 }, sx]}>
      {plainHeader}
      {content}
    </Box>
  )
}
