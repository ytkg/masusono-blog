import Box from "@mui/material/Box"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticleCard from "./ArticleCard"

export default function ArticlesList({ articles, emptyMessage = "記事がありません。" }) {
  if (!articles?.length) {
    return <EmptyStatus>{emptyMessage}</EmptyStatus>
  }

  return (
    <Box sx={{ display: "grid", gap: { xs: 1.5, sm: 2 } }}>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          sx={{
            "& + &": { borderTop: "1px solid", borderColor: "divider", pt: 2 },
          }}
        />
      ))}
    </Box>
  )
}
