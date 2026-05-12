import { Link, usePage } from "@inertiajs/react"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { MAIN_NAVIGATION_LINKS } from "../shared/mainNavigationLinks"

export default function Footer() {
  const year = new Date().getFullYear()
  const { url } = usePage()
  const path = String(url || "/").split("?")[0]
  const active = MAIN_NAVIGATION_LINKS.find((tab) => tab.href !== "/" && path.startsWith(tab.href))?.value ?? "home"

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
        {MAIN_NAVIGATION_LINKS.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            component={Link}
            href={tab.href}
            prefetch
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
