import { Link, usePage } from "@inertiajs/react"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import HomeIcon from "@mui/icons-material/Home"
import ArticleIcon from "@mui/icons-material/MenuBook"
import PodcastIcon from "@mui/icons-material/Podcasts"
import PlaceIcon from "@mui/icons-material/Place"

const TABS = [
  { value: "home", label: "ホーム", href: "/", icon: <HomeIcon /> },
  { value: "blog", label: "ブログ", href: "/blog", icon: <ArticleIcon /> },
  { value: "podcast", label: "ポッドキャスト", href: "/podcast", icon: <PodcastIcon /> },
  { value: "shops", label: "推し店", href: "/shop", icon: <PlaceIcon /> },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const { url } = usePage()
  const path = String(url || "/").split("?")[0]
  const active = TABS.find((tab) => tab.href !== "/" && path.startsWith(tab.href))?.value ?? "home"

  return (
    <Paper
      component="footer"
      square
      sx={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100%",
        zIndex: (t) => t.zIndex.appBar,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <BottomNavigation
        showLabels
        value={active}
        sx={{
          ".MuiBottomNavigationAction-root": {
            minWidth: 0,
            px: 0.5,
          },
          ".MuiBottomNavigationAction-label": {
            whiteSpace: "nowrap",
          },
        }}
      >
        {TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            component={Link}
            href={tab.href}
          />
        ))}
      </BottomNavigation>
      <Box
        sx={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primary.main",
          color: "common.white",
        }}
      >
        <Typography variant="body2" color="inherit">
          © {year} 増田とその他！
        </Typography>
      </Box>
    </Paper>
  )
}
