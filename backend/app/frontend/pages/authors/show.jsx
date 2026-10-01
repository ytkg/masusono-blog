import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import ArticlesList from "../../features/blog/ArticlesList"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"

import AuthorProfile from "../../features/authors/AuthorProfile"

function ArticlesSectionHeader({ count }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 1,
        pb: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.secondary",
      }}
    >
      <Typography variant="subtitle2" component="h2" sx={{ m: 0, color: "text.primary", fontWeight: 700 }}>
        投稿
      </Typography>
      <Typography variant="body2" sx={{ m: 0 }}>
        {count}件
      </Typography>
    </Box>
  )
}

export default function AuthorShow({ author, articles = [] }) {
  return (
    <>
      <SeoHead
        title={author?.name ?? "著者"}
        description={
          author ? `${author.name}の記事とプロフィールをまとめたページです。` : "著者の記事とプロフィールページです。"
        }
        canonicalPath={author ? `/authors/${author.id}` : undefined}
      />
      <PageContainer id="author">
        <Stack spacing={2.5}>
          {author ? <AuthorProfile author={author} /> : null}
          <Stack spacing={1.5}>
            <ArticlesSectionHeader count={articles.length} />
            <ArticlesList articles={articles} emptyMessage="この著者の記事はまだありません。" />
          </Stack>
        </Stack>
      </PageContainer>
    </>
  )
}
