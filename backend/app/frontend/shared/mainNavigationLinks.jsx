import HomeIcon from "@mui/icons-material/Home"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import PodcastsIcon from "@mui/icons-material/Podcasts"

export const MAIN_NAVIGATION_LINKS = [
  { value: "home", label: "ホーム", href: "/", icon: <HomeIcon /> },
  {
    value: "blog",
    label: "ブログ",
    description: "最新の記事やお知らせはこちら",
    href: "/blog",
    icon: <MenuBookIcon />,
  },
  {
    value: "podcast",
    label: "ポッドキャスト",
    description: "番組のアーカイブを毎週更新",
    href: "/podcast",
    icon: <PodcastsIcon />,
  },
]

export const HOME_FEATURE_LINKS = MAIN_NAVIGATION_LINKS.filter((link) => link.href !== "/")
