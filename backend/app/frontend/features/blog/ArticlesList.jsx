import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles, emptyMessage = "記事がありません。" }) {
  if (!articles?.length) {
    return <Typography color="text.secondary">{emptyMessage}</Typography>
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Box>
  )
}
