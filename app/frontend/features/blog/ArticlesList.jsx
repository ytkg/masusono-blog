import Box from "@mui/material/Box"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles, emptyMessage = "記事がありません。" }) {
  if (!articles?.length) {
    return <EmptyStatus>{emptyMessage}</EmptyStatus>
  }

  return (
    <Box sx={{ display: "grid", gap: { xs: 2, sm: 3 } }}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Box>
  )
}
