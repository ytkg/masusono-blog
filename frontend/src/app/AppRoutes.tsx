import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

const About = lazy(() => import("@/pages/About"))
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"))
const Blog = lazy(() => import("@/pages/Blog"))
const Home = lazy(() => import("@/pages/Home"))
const Podcast = lazy(() => import("@/pages/Podcast"))
const PodcastDetail = lazy(() => import("@/pages/PodcastDetail"))
const Shops = lazy(() => import("@/pages/Shops"))

function RoutesFallback() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
      <CircularProgress aria-label="ページを読み込み中" size={28} />
    </Box>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RoutesFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:articleId" element={<ArticleDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/podcast/:episodeId" element={<PodcastDetail />} />
        <Route path="/shops" element={<Shops />} />
      </Routes>
    </Suspense>
  )
}
