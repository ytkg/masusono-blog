import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles }) {
  if (!articles?.length) {
    return <Typography color="text.secondary">記事がありません。</Typography>
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Box>
  )
}
