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
import logo from "../assets/logo.webp"

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
          alignItems: "flex-end",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          minHeight: HEADER_TOOLBAR_HEIGHT,
          pt: 0,
          pb: { xs: 0.5, sm: 0.75 },
          px: PAGE_HORIZONTAL_PADDING,
          width: "100%",
          maxWidth: PAGE_MAX_WIDTH,
          mx: "auto",
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
            alignItems: "flex-end",
            gridColumn: 2,
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="増田とその他！"
            sx={{
              height: { xs: 40, sm: 48 },
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
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
