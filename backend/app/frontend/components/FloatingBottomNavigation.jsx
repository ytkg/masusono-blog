import { Link, usePage } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { HEADER_HEIGHT } from "../shared/pageLayout"
import { MAIN_NAVIGATION_LINKS } from "../shared/mainNavigationLinks"
import { requestHomeFeed } from "../shared/lib/homeNavigation"
import { navigationPrefetchKey, navigationPrefetchProps } from "../shared/lib/navigationPrefetch"

export default function FloatingBottomNavigation() {
  const { url } = usePage()
  const path = String(url || "/").split("?")[0]
  return (
    <Box
      component="nav"
      aria-label="メインナビゲーション"
      sx={{
        position: { xs: "sticky", lg: "fixed" },
        top: { ...HEADER_HEIGHT, lg: 0 },
        left: { lg: 0 },
        width: { xs: "100%", lg: 220 },
        height: { xs: 48, lg: "100dvh" },
        bgcolor: { xs: "background.default", lg: "primary.main" },
        color: { xs: "text.primary", lg: "#fff" },
        zIndex: (theme) => theme.zIndex.appBar,
        px: { xs: 2, lg: 3 },
        display: "flex",
        flexDirection: { xs: "row", lg: "column" },
        alignItems: { xs: "center", lg: "stretch" },
        gap: { lg: 1 },
        borderBottom: { xs: "1px solid", lg: 0 },
        borderColor: "divider",
        overflow: "auto",
      }}
    >
      <Box sx={{ display: { xs: "none", lg: "block" }, pt: 5, pb: 5 }}>
        <Typography sx={{ fontSize: 68, fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.1em" }}>
          m/o.
        </Typography>
        <Typography sx={{ fontSize: 12 }}>増田とその他！</Typography>
      </Box>
      {MAIN_NAVIGATION_LINKS.map((item, index) => {
        const active = item.href === "/" ? path === "/" : path === item.href || path.startsWith(`${item.href}/`)
        return (
          <Box
            component={Link}
            key={navigationPrefetchKey({ href: item.href, currentPath: path })}
            {...navigationPrefetchProps({ href: item.href, currentPath: path, isActive: active })}
            href={item.href}
            onClick={item.href === "/" ? requestHomeFeed : undefined}
            className={active ? "Mui-selected" : undefined}
            aria-current={active ? "page" : undefined}
            sx={{
              flex: { xs: "1 1 0", lg: "0 0 auto" },
              minWidth: 0,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", lg: "flex-start" },
              gap: 2,
              fontSize: { xs: 12, lg: 17 },
              fontWeight: active ? 900 : 500,
              color: active ? { xs: "primary.main", lg: "#dcf89c" } : "inherit",
              textDecoration: "none",
              borderBottom: { xs: active ? "3px solid" : "3px solid transparent", lg: "1px solid #ffffff33" },
              "&:focus-visible": { outline: "2px solid currentColor", outlineOffset: "-2px" },
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{ display: { xs: "none", lg: "inline" }, fontSize: 11, opacity: 0.6 }}
            >
              {String(index + 1).padStart(2, "0")}
            </Box>
            <Box component="span">{item.label}</Box>
          </Box>
        )
      })}
      <Typography sx={{ display: { xs: "none", lg: "block" }, mt: "auto", py: 4, fontSize: 12, lineHeight: 2 }}>
        とりとめなく、
        <br />
        おもしろく。
        <br />
        OUR LITTLE CORNER OF THE WEB.
      </Typography>
    </Box>
  )
}
