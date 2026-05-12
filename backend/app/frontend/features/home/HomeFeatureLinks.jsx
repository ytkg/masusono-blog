import Box from "@mui/material/Box"
import HomeRecommendedArticles from "./HomeRecommendedArticles"

export default function HomeFeatureLinks() {
  return (
    <Box sx={{ display: "grid", gap: 1.75 }}>
      <HomeRecommendedArticles />
    </Box>
  )
}
