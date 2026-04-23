import Box from "@mui/material/Box"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import PlaceIcon from "@mui/icons-material/Place"
import PodcastsIcon from "@mui/icons-material/Podcasts"
import FeatureLinkCard from "../../shared/FeatureLinkCard"
import HomeRecommendedArticles from "./HomeRecommendedArticles"

const featureLinks = [
  { label: "ブログ", description: "最新の記事やお知らせはこちら", href: "/blog", icon: <MenuBookIcon /> },
  {
    label: "ポッドキャスト",
    description: "番組のアーカイブを毎週更新",
    href: "/podcast",
    icon: <PodcastsIcon />,
  },
  { label: "推し店", description: "おすすめスポットをマップで紹介", href: "/shop", icon: <PlaceIcon /> },
]

export default function HomeFeatureLinks() {
  return (
    <Box sx={{ display: "grid", gap: 1.75 }}>
      {featureLinks.map((item) => (
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
