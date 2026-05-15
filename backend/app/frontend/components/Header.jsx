import { useEffect, useState } from "react"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { Link } from "@inertiajs/react"
import logo from "../assets/logo.webp"

function getHeaderDateParts(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    weekday: "short",
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))

  return {
    date: `${parts.month}/${parts.day}`,
    weekday: parts.weekday.toUpperCase(),
  }
}

export default function Header() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const headerDate = getHeaderDateParts(now)

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
        <Typography
          variant="caption"
          sx={{
            alignSelf: "center",
            color: "text.primary",
            display: "inline-flex",
            alignItems: "baseline",
            fontSize: "1.125rem",
            fontWeight: 600,
            gap: 0.5,
            gridColumn: 1,
            gridRow: 1,
            justifySelf: "start",
            lineHeight: 1.2,
            maxWidth: "100%",
            overflow: "hidden",
            textAlign: "left",
            textOverflow: "ellipsis",
            transform: "translateY(2px)",
            whiteSpace: "nowrap",
          }}
        >
          <Box component="span">{headerDate.date}</Box>
          <Box component="span" sx={{ fontSize: "0.75em", lineHeight: 1 }}>
            {headerDate.weekday}
          </Box>
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
