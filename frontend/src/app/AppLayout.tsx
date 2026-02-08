import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import ScrollRestoration from "@/components/ScrollRestoration"
import GlobalPodcastMiniPlayer from "@/features/podcastPlayer/ui/GlobalPodcastMiniPlayer"
import AppRoutes from "./AppRoutes"

export default function AppLayout() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header />
      <ScrollRestoration />
      <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0, pb: { xs: 12, sm: 12 } }}>
        <AppRoutes />
        {/* ページ毎の固有要素は各ページ側で配置 */}
      </Container>
      <GlobalPodcastMiniPlayer />
      <Footer />
    </Box>
  )
}
