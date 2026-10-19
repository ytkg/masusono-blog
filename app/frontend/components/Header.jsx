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
import seasonalLogo from "../assets/logo-autumn-health-v8.png"
import { useSeasonalLogo } from "@/shared/lib/seasonalLogo"
import useVisibleHealthPhrase from "@/shared/lib/useVisibleHealthPhrase"

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
    return
  }

  window.location.assign("/")
}

export default function Header() {
  const { url, props } = usePage()
  const seasonalLogoEnabled = useSeasonalLogo(props?.app?.seasonalLogoEnabled ?? false)
  const healthPhraseVisible = useVisibleHealthPhrase()
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

  const [path, search = ""] = currentUrl.split("#", 1)[0].split("?")
  const showsSeasonalLogo = seasonalLogoEnabled || path === "/articles/1cxjrah487" || healthPhraseVisible
  const hasSearchQuery = path === "/search" && Boolean(new URLSearchParams(search).get("q")?.trim())
  const showsBackButton = path.startsWith("/articles/") || path.startsWith("/authors/") || hasSearchQuery

  return (
    <AppBar position="sticky" color="transparent" enableColorOnDark sx={headerSx}>
      <Toolbar disableGutters sx={headerToolbarSx}>
        <Box sx={headerLogoLinkSx}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              maxWidth: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              transform: showsSeasonalLogo ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 600ms ease-in-out",
              "@media (prefers-reduced-motion: reduce)": { transition: "none" },
            }}
          >
            <Box
              component={Link}
              key={navigationPrefetchKey({ href: "/", currentPath: path })}
              {...navigationPrefetchProps({ href: "/", currentPath: path })}
              href="/"
              onClick={requestHomeFeed}
              sx={{ display: "inline-flex", maxWidth: "100%", transformStyle: "preserve-3d" }}
            >
              {[false, true].map((seasonal) => (
                <Box
                  key={String(seasonal)}
                  component="img"
                  src={seasonal ? seasonalLogo : logo}
                  alt={seasonal !== showsSeasonalLogo ? "" : seasonal ? "増田とその他！と、私の体調" : "増田とその他！"}
                  aria-hidden={seasonal !== showsSeasonalLogo}
                  sx={{
                    ...headerLogoImageSx,
                    backfaceVisibility: "hidden",
                    transform: seasonal ? "rotateY(180deg)" : "rotateY(0deg)",
                    ...(seasonal !== showsSeasonalLogo && {
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      maxWidth: "none",
                      transform: `translateX(-50%) rotateY(${seasonal ? 180 : 0}deg)`,
                    }),
                  }}
                />
              ))}
            </Box>
          </Box>
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
