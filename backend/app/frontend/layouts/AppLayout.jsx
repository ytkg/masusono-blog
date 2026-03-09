import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Footer from "../components/Footer"
import Header from "../components/Header"
import PwaInstallButton from "../components/PwaInstallButton"
import { PodcastPlayerProvider } from "../features/podcastPlayer/PodcastPlayerContext.jsx"
import GlobalPodcastMiniPlayer from "../features/podcastPlayer/ui/GlobalPodcastMiniPlayer"

export default function AppLayout({ children }) {
  return (
    <PodcastPlayerProvider>
      <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <Header />
        <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0, pb: { xs: 12, sm: 12 } }}>
          {children}
        </Container>
        <PwaInstallButton />
        <GlobalPodcastMiniPlayer />
        <Footer />
      </Box>
    </PodcastPlayerProvider>
  )
}
