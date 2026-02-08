import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import ContentCardSkeletonList from "@/shared/ui/ContentCardSkeletonList"
import Home from "@/pages/Home"

const About = lazy(() => import("@/pages/About"))
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"))
const Blog = lazy(() => import("@/pages/Blog"))
const Podcast = lazy(() => import("@/pages/Podcast"))
const PodcastDetail = lazy(() => import("@/pages/PodcastDetail"))
const Shops = lazy(() => import("@/pages/Shops"))

function RoutesFallback() {
  return <ContentCardSkeletonList count={3} sx={{ px: { xs: 2, sm: 3 }, py: 3 }} />
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
