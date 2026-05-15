import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import ArticlesList from "../../features/blog/ArticlesList"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"

function AuthorProfile({ author }) {
  const image = author.imageUrl

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 1.25, sm: 1.5 },
        textAlign: "center",
      }}
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt={`${author.name}のアイコン`}
          sx={{
            width: { xs: 96, sm: 128 },
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
            objectFit: "cover",
          }}
        />
      ) : null}
      <Stack spacing={0.75} sx={{ minWidth: 0, maxWidth: 640 }}>
        <Typography variant="overline" color="text.secondary" sx={{ m: 0, fontWeight: 700, lineHeight: 1.4 }}>
          {author.title}
        </Typography>
        <Typography variant="h5" component="h1" sx={{ m: 0, fontWeight: 700, lineHeight: 1.25 }}>
          {author.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ m: 0, lineHeight: 1.9, textAlign: "left" }}>
          {author.bio}
        </Typography>
      </Stack>
    </Box>
  )
}

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
            <ArticlesList articles={articles} variant="divided" emptyMessage="この著者の記事はまだありません。" />
          </Stack>
        </Stack>
      </PageContainer>
    </>
  )
}
