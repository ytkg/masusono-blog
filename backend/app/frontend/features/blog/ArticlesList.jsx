import Box from "@mui/material/Box"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles, emptyMessage = "記事がありません。" }) {
  if (!articles?.length) {
    return <EmptyStatus>{emptyMessage}</EmptyStatus>
  }

  return (
    <Box>
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          sx={{
            borderBottom: index < articles.length - 1 ? "1px solid" : 0,
            borderColor: "divider",
            pt: index === 0 ? 0 : 1.5,
            pb: index < articles.length - 1 ? 1.5 : 0,
          }}
        />
      ))}
    </Box>
  )
}
