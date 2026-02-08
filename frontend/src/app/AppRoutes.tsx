import { Route, Routes } from "react-router-dom"
import About from "@/pages/About"
import ArticleDetail from "@/pages/ArticleDetail"
import Blog from "@/pages/Blog"
import Home from "@/pages/Home"
import Podcast from "@/pages/Podcast"
import PodcastDetail from "@/pages/PodcastDetail"
import Shops from "@/pages/Shops"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:articleId" element={<ArticleDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/podcast" element={<Podcast />} />
      <Route path="/podcast/:episodeId" element={<PodcastDetail />} />
      <Route path="/shops" element={<Shops />} />
    </Routes>
  )
}
