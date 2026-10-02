import { useEffect, useState } from "react"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import { Link, usePage } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { currentLocationPath, LOCATION_CHANGE_EVENT } from "@/shared/lib/locationEvents"
import { requestHomeFeed } from "@/shared/lib/homeNavigation"
import { navigationPrefetchKey, navigationPrefetchProps } from "@/shared/lib/navigationPrefetch"
import { HEADER_HEIGHT, HEADER_TOOLBAR_HEIGHT, PAGE_MAX_WIDTH, PAGE_HORIZONTAL_PADDING } from "../shared/pageLayout"
import Typography from "@mui/material/Typography"

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.assign("/")
}

export default function Header() {
  const { url } = usePage()
  const [currentUrl, setCurrentUrl] = useState(() => String(url || "/"))

  useEffect(() => {
    setCurrentUrl(String(url || "/"))
  }, [url])

  useEffect(() => {
    function syncCurrentUrl() {
      setCurrentUrl(currentLocationPath())
    }

    window.addEventListener("popstate", syncCurrentUrl)
    window.addEventListener(LOCATION_CHANGE_EVENT, syncCurrentUrl)

    return () => {
      window.removeEventListener("popstate", syncCurrentUrl)
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncCurrentUrl)
    }
  }, [])

  const [path, search = ""] = currentUrl.split("?")
  const hasSearchQuery = path === "/search" && Boolean(new URLSearchParams(search).get("q")?.trim())
  const showsBackButton = path.startsWith("/articles/") || path.startsWith("/authors/") || hasSearchQuery

  return (
    <AppBar
      position="sticky"
      color="transparent"
      enableColorOnDark
      sx={{
        minHeight: HEADER_HEIGHT,
        width: { xs: "100%", lg: "calc(100% - 220px)" },
        ml: { lg: "220px" },
        py: 0,
        bgcolor: "background.default",
        color: "text.primary",
        boxShadow: "none",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          alignItems: "center",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          minHeight: HEADER_TOOLBAR_HEIGHT,
          pt: 0,
          pb: { xs: 0.5, sm: 0.75 },
          px: PAGE_HORIZONTAL_PADDING,
          width: "100%",
          maxWidth: PAGE_MAX_WIDTH,
          mx: { xs: "auto", lg: 0 },
        }}
      >
        <Box
          component={Link}
          key={navigationPrefetchKey({ href: "/", currentPath: path })}
          {...navigationPrefetchProps({ href: "/", currentPath: path })}
          href="/"
          onClick={requestHomeFeed}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gridColumn: 2,
            gridRow: 1,
            justifySelf: "start",
            ml: 1,
            textDecoration: "none",
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: 900,
              fontSize: { xs: 32, sm: 40 },
              letterSpacing: "-0.09em",
              lineHeight: 1,
              fontStyle: "italic",
            }}
          >
            <Box component="span" aria-hidden="true">
              m/o.
            </Box>
            <Box
              component="span"
              sx={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)" }}
            >
              増田とその他！
            </Box>
          </Typography>
        </Box>
        <Box
          component={Link}
          href="/about"
          sx={{
            gridColumn: 3,
            gridRow: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 999,
            px: 2,
            py: 1,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ABOUT ↗
        </Box>
        {showsBackButton ? (
          <IconButton
            aria-label="前のページに戻る"
            onClick={goBack}
            size="small"
            sx={{
              alignSelf: "center",
              color: "text.secondary",
              gridColumn: 1,
              gridRow: 1,
              justifySelf: "start",
              transform: "translateY(2px)",
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  )
}
