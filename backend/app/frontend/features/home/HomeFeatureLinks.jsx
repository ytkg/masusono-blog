import Box from "@mui/material/Box"
import FeatureLinkCard from "../../shared/FeatureLinkCard"
import { HOME_FEATURE_LINKS } from "../../shared/mainNavigationLinks"
import HomeRecommendedArticles from "./HomeRecommendedArticles"

export default function HomeFeatureLinks() {
  return (
    <Box sx={{ display: "grid", gap: 1.75 }}>
      {HOME_FEATURE_LINKS.map((item) => (
        <FeatureLinkCard
          key={item.href}
          title={item.label}
          description={item.description}
          href={item.href}
          icon={item.icon}
        />
      ))}
      <HomeRecommendedArticles />
    </Box>
  )
}
