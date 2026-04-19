import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import { Link } from "@inertiajs/react"
import logo from "../assets/logo.webp"

export default function Header() {
  return (
    <AppBar position="sticky" color="primary" enableColorOnDark sx={{ minHeight: { xs: 44, sm: 52 }, py: 0 }}>
      <Toolbar
        disableGutters
        sx={{
          justifyContent: "center",
          alignItems: "flex-end",
          minHeight: { xs: 44, sm: 52 },
          pt: 0,
          pb: { xs: 0.5, sm: 0.75 },
        }}
      >
        <Box
          component={Link}
          href="/"
          prefetch
          sx={{
            display: "inline-flex",
            alignItems: "flex-end",
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
      </Toolbar>
    </AppBar>
  )
}
