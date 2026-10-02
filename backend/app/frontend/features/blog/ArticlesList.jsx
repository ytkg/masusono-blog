import Box from "@mui/material/Box"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles, emptyMessage = "記事がありません。" }) {
  if (!articles?.length) {
    return <EmptyStatus>{emptyMessage}</EmptyStatus>
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
        alignItems: "start",
        gap: 3,
      }}
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Box>
  )
}
