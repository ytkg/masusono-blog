import { Link, usePage } from "@inertiajs/react"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import Paper from "@mui/material/Paper"
import {
  NAVIGATION_CONTENT_HEIGHT,
  NAVIGATION_VERTICAL_PADDING,
  NAVIGATION_BORDER_WIDTH,
  navigationBottomSx,
  PAGE_INNER_MAX_WIDTH,
} from "../shared/pageLayout"
import { MAIN_NAVIGATION_LINKS } from "../shared/mainNavigationLinks"
import { requestHomeFeed } from "../shared/lib/homeNavigation"
import { navigationPrefetchKey, navigationPrefetchProps } from "../shared/lib/navigationPrefetch"

const INDICATOR_HALF_WIDTH = 16
const INDICATOR_TRANSITION_DURATION = 280
const NAVIGATION_LABEL_FONT_SIZE = "0.72rem"

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
    <Paper
      component="nav"
      elevation={0}
      aria-label="メインナビゲーション"
      sx={{
        position: "fixed",
        left: "50%",
        bottom: navigationBottomSx,
        transform: "translateX(-50%)",
        width: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)" },
        maxWidth: PAGE_INNER_MAX_WIDTH,
        zIndex: (t) => t.zIndex.appBar,
        overflow: "hidden",
        bgcolor: "common.white",
        color: "text.primary",
        border: `${NAVIGATION_BORDER_WIDTH}px solid`,
        borderColor: "divider",
        borderRadius: 999,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
        px: { xs: 1, sm: 1.25 },
        py: `${NAVIGATION_VERTICAL_PADDING}px`,
      }}
    >
      <BottomNavigation
        showLabels
        value={active}
        sx={{
          "--navigation-item-count": MAIN_NAVIGATION_LINKS.length,
          "--navigation-active-index": activeIndex,
          width: "100%",
          maxWidth: "100%",
          height: NAVIGATION_CONTENT_HEIGHT,
          position: "relative",
          bgcolor: "transparent",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::after": {
            content: hasActiveItem ? '""' : "none",
            position: "absolute",
            left: "calc((100% / var(--navigation-item-count)) * var(--navigation-active-index))",
            bottom: 4,
            width: "calc(100% / var(--navigation-item-count))",
            height: 2,
            pointerEvents: "none",
            background: `linear-gradient(to right, transparent calc(50% - ${INDICATOR_HALF_WIDTH}px), currentColor calc(50% - ${INDICATOR_HALF_WIDTH}px), currentColor calc(50% + ${INDICATOR_HALF_WIDTH}px), transparent calc(50% + ${INDICATOR_HALF_WIDTH}px))`,
            transition: (t) =>
              t.transitions.create("left", {
                duration: INDICATOR_TRANSITION_DURATION,
                easing: t.transitions.easing.easeOut,
              }),
          },
          "&::-webkit-scrollbar": {
            display: "none",
          },
          ".MuiBottomNavigationAction-root": {
            minWidth: 0,
            flex: "1 1 0",
            position: "relative",
            px: { xs: 1, sm: 1.25 },
            mx: 0.25,
            borderRadius: 999,
            color: "text.secondary",
            "&.Mui-selected": {
              color: "text.primary",
            },
          },
          ".MuiSvgIcon-root": {
            fontSize: 22,
          },
          ".MuiBottomNavigationAction-label": {
            whiteSpace: "nowrap",
            fontSize: NAVIGATION_LABEL_FONT_SIZE,
            "&.Mui-selected": {
              fontSize: NAVIGATION_LABEL_FONT_SIZE,
              fontWeight: 700,
            },
          },
        }}
      >
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
