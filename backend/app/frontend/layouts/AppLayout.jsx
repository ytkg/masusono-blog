import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import FloatingBottomNavigation from "../components/FloatingBottomNavigation"
import Header from "../components/Header"
import { PAGE_MAX_WIDTH } from "../shared/pageLayout"

export default function AppLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Container
        component="main"
        maxWidth={false}
        disableGutters
        sx={{
          flexGrow: 1,
          maxWidth: PAGE_MAX_WIDTH,
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
