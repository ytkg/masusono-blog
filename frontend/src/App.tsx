import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Blog from "./components/Blog"
import Podcast from "./components/Podcast"
import GlobalPodcastMiniPlayer from "./components/GlobalPodcastMiniPlayer"
import "./App.css"
import { Routes, Route } from "react-router-dom"
import Shops from "./pages/Shops"
import Home from "./pages/Home"
import ScrollRestoration from "./components/ScrollRestoration"
import ArticleDetail from "./pages/ArticleDetail"
import About from "./pages/About"
import PodcastDetail from "./pages/PodcastDetail"
import { PodcastPlayerProvider } from "./features/podcastPlayer/PodcastPlayerContext"

export default function App() {
  return (
    <PodcastPlayerProvider>
      <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <Header />
        <ScrollRestoration />
        <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0, pb: { xs: 12, sm: 12 } }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:articleId" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/podcast/:episodeId" element={<PodcastDetail />} />
            <Route path="/shops" element={<Shops />} />
          </Routes>
          {/* ページ毎の固有要素は各ページ側で配置 */}
        </Container>
        <GlobalPodcastMiniPlayer />
        <Footer />
      </Box>
    </PodcastPlayerProvider>
  )
}
