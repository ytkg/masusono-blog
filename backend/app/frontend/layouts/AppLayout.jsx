import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import FloatingBottomNavigation from "../components/FloatingBottomNavigation"
import Header from "../components/Header"
import { PAGE_MAX_WIDTH } from "../shared/pageLayout"

export default function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Header />
      <FloatingBottomNavigation />
      <Container
        component="main"
        maxWidth={false}
        disableGutters
        sx={{
          flexGrow: 1,
          width: { xs: "100%", lg: "calc(100% - 220px)" },
          ml: { lg: "220px" },
          mr: { lg: "auto" },
          maxWidth: PAGE_MAX_WIDTH,
          py: 0,
          px: 0,
          pb: {
            xs: "calc(32px + env(safe-area-inset-bottom))",
            sm: "calc(40px + env(safe-area-inset-bottom))",
          },
        }}
      >
        {children}
      </Container>
    </Box>
  )
}
