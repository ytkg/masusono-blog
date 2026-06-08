import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import FloatingBottomNavigation from "../components/FloatingBottomNavigation"
import Header from "../components/Header"

export default function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Container
        component="main"
        disableGutters
        sx={{
          flexGrow: 1,
          py: 0,
          px: 0,
          pb: {
            xs: "calc(80px + env(safe-area-inset-bottom))",
            sm: "calc(84px + env(safe-area-inset-bottom))",
          },
        }}
      >
        {children}
      </Container>
      <FloatingBottomNavigation />
    </Box>
  )
}
