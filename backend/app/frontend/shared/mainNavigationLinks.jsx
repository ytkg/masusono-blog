import HomeIcon from "@mui/icons-material/Home"
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import NumbersIcon from "@mui/icons-material/Numbers"

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
    value: "numbers",
    label: "数字",
    href: "/numbers",
    icon: <NumbersIcon />,
  },
  {
    value: "zukan",
    label: "図鑑",
    href: "/zukan",
    icon: <CollectionsBookmarkIcon />,
  },
]
