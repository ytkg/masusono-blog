import { Link, usePage } from "@inertiajs/react"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
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
        left: { xs: "50%", lg: 0 },
        top: { lg: 0 },
        height: { lg: "100dvh" },
        bottom: { ...navigationBottomSx, lg: 0 },
        transform: { xs: "translateX(-50%)", lg: "none" },
        width: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)", lg: 220 },
        maxWidth: Math.min(PAGE_INNER_MAX_WIDTH, 640),
        zIndex: (t) => t.zIndex.appBar,
        overflow: { xs: "hidden", lg: "auto" },
        bgcolor: "#252820",
        color: "#fffdf7",
        border: `${NAVIGATION_BORDER_WIDTH}px solid`,
        borderColor: "#252820",
        borderRadius: { xs: 2, lg: 0 },
        boxShadow: "6px 6px 0 #e54520",
        px: { xs: 1, sm: 1.25, lg: 3 },
        display: { lg: "flex" },
        flexDirection: { lg: "column" },
        py: `${NAVIGATION_VERTICAL_PADDING}px`,
      }}
    >
      <Box sx={{ display: { xs: "none", lg: "block" }, pt: 3, pb: 4 }}>
        <Typography sx={{ color: "#ff8867", fontSize: 11, letterSpacing: "0.16em", mb: 2 }}>
          INDEPENDENT JOURNAL
        </Typography>
        <Typography sx={{ fontSize: 38, fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.07em" }}>
          増田と
          <br />
          その他<span style={{ color: "#ff8867" }}>！</span>
        </Typography>
      </Box>
      <BottomNavigation
        showLabels
        value={active}
        sx={{
          "--navigation-item-count": MAIN_NAVIGATION_LINKS.length,
          "--navigation-active-index": activeIndex,
          width: "100%",
          maxWidth: "100%",
          height: { xs: NAVIGATION_CONTENT_HEIGHT, lg: "auto" },
          flexShrink: 0,
          flexDirection: { lg: "column" },
          gap: { lg: 1 },
          position: "relative",
          bgcolor: "transparent",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::after": {
            display: { lg: "none" },
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
            flexDirection: { lg: "row" },
            justifyContent: { lg: "flex-start" },
            gap: { lg: 2 },
            minHeight: { lg: 56 },
            borderBottom: { lg: "1px solid #4a4d42" },
            flex: "1 1 0",
            position: "relative",
            px: { xs: 1, sm: 1.25 },
            mx: 0.25,
            borderRadius: 2,
            color: "#b8bcad",
            "&.Mui-selected": {
              color: "#ff8867",
            },
          },
          ".MuiSvgIcon-root": {
            fontSize: 22,
          },
          ".MuiBottomNavigationAction-label": {
            whiteSpace: "nowrap",
            fontSize: { xs: NAVIGATION_LABEL_FONT_SIZE, lg: "0.9rem" },
            "&.Mui-selected": {
              fontSize: { xs: NAVIGATION_LABEL_FONT_SIZE, lg: "0.9rem" },
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
      <Box sx={{ display: { xs: "none", lg: "block" }, mt: "auto", pb: 2, pt: 3 }}>
        <Typography sx={{ fontSize: 40, color: "#ff8867", mb: 1 }}>✳</Typography>
        <Typography sx={{ fontSize: 12, lineHeight: 2, color: "#b8bcad" }}>
          気楽にのぞいて、
          <br />
          ちょっと笑って。
          <br />
          日々を綴る、小さな場所。
        </Typography>
      </Box>
    </Paper>
  )
}
