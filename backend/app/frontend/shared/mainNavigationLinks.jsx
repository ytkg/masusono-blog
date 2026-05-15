import HomeIcon from "@mui/icons-material/Home"
import AppsIcon from "@mui/icons-material/Apps"
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark"
import NumbersIcon from "@mui/icons-material/Numbers"

export const MAIN_NAVIGATION_LINKS = [
  { value: "home", label: "ホーム", href: "/", icon: <HomeIcon /> },
  {
    value: "authors",
    label: "著者",
    href: "/authors",
    icon: <CollectionsBookmarkIcon />,
  },
  {
    value: "numbers",
    label: "数字",
    href: "/numbers",
    icon: <NumbersIcon />,
  },
  {
    value: "others",
    label: "その他！",
    href: "/others",
    icon: <AppsIcon />,
  },
]
