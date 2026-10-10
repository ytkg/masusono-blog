import { navigationPaperSx, buildBottomNavigationSx } from "./navigationStyles"
import { Link, usePage } from "@inertiajs/react"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import Paper from "@mui/material/Paper"
import { MAIN_NAVIGATION_LINKS } from "../shared/mainNavigationLinks"
import { requestHomeFeed } from "../shared/lib/homeNavigation"
import { navigationPrefetchKey, navigationPrefetchProps } from "../shared/lib/navigationPrefetch"

function matchesNavigationPath(path, href) {
  if (href === "/") return path === "/"

  return path === href || path.startsWith(`${href}/`)
}

function currentNavigationIndex(path) {
  return MAIN_NAVIGATION_LINKS.findIndex((tab) => matchesNavigationPath(path, tab.href))
}

function navigationPathFromUrl(url) {
  return String(url || "/").split("?")[0]
}

export default function FloatingBottomNavigation() {
  const { url } = usePage()
  const path = navigationPathFromUrl(url)
  const activeIndex = currentNavigationIndex(path)
  const active = activeIndex >= 0 ? MAIN_NAVIGATION_LINKS[activeIndex].value : null
  const hasActiveItem = activeIndex >= 0

  return (
    <Paper component="nav" elevation={0} aria-label="メインナビゲーション" sx={navigationPaperSx}>
      <BottomNavigation showLabels value={active} sx={buildBottomNavigationSx(activeIndex, hasActiveItem)}>
        {MAIN_NAVIGATION_LINKS.map((tab) => (
          <BottomNavigationAction
            key={navigationPrefetchKey({ href: tab.href, currentPath: path })}
            {...navigationPrefetchProps({ href: tab.href, currentPath: path, isActive: tab.value === active })}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            component={Link}
            href={tab.href}
            onClick={tab.href === "/" ? requestHomeFeed : undefined}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
