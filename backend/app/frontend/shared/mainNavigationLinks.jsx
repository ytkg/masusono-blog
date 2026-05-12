import HomeIcon from "@mui/icons-material/Home"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import SettingsIcon from "@mui/icons-material/Settings"

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
    value: "settings",
    label: "設定",
    href: "/settings",
    icon: <SettingsIcon />,
  },
]

export const HOME_FEATURE_LINKS = MAIN_NAVIGATION_LINKS.filter((link) => !["/", "/settings"].includes(link.href))
