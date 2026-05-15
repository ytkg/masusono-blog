import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles, emptyMessage = "記事がありません。", variant = "cards" }) {
  if (!articles?.length) {
    return <Typography color="text.secondary">{emptyMessage}</Typography>
  }

  if (variant === "divided") {
    return (
      <Box>
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            presentation="plain"
            sx={{
              borderBottom: index < articles.length - 1 ? "1px solid" : 0,
              borderColor: "divider",
              pt: index === 0 ? 0 : 2.5,
              pb: 2.5,
            }}
          />
        ))}
      </Box>
    )
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Box>
  )
}
