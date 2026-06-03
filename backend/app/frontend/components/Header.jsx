import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import { Link, usePage } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
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
  const path = String(url || "/").split("?")[0]
  const showsBackButton = path.startsWith("/articles/") || path.startsWith("/authors/")

  return (
    <AppBar
      position="sticky"
      color="transparent"
      enableColorOnDark
      sx={{
        minHeight: { xs: 44, sm: 52 },
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
          minHeight: { xs: 44, sm: 52 },
          pt: 0,
          pb: { xs: 0.5, sm: 0.75 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          component={Link}
          href="/"
          prefetch
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
              transform: "translate(-8px, 2px)",
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : null}
      </Toolbar>
    </AppBar>
  )
}
