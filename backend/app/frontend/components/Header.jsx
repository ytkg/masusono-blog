import { headerSx, headerToolbarSx, headerLogoLinkSx, headerLogoImageSx, headerBackButtonSx } from "./navigationStyles"
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
    <AppBar position="sticky" color="transparent" enableColorOnDark sx={headerSx}>
      <Toolbar disableGutters sx={headerToolbarSx}>
        <Box
          component={Link}
          key={navigationPrefetchKey({ href: "/", currentPath: path })}
          {...navigationPrefetchProps({ href: "/", currentPath: path })}
          href="/"
          onClick={requestHomeFeed}
          sx={headerLogoLinkSx}
        >
          <Box component="img" src={logo} alt="増田とその他！" sx={headerLogoImageSx} />
        </Box>
        {showsBackButton ? (
          <IconButton aria-label="前のページに戻る" onClick={goBack} size="small" sx={headerBackButtonSx}>
            <ArrowBackIcon />
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  )
}
