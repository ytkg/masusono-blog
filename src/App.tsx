import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from './components/Header'
import Footer from './components/Footer'
import Blog from './components/Blog'
import Podcast from './components/Podcast'
import './App.css'
import BottomTabs from './components/BottomTabs'
import { Routes, Route } from 'react-router-dom'
import MasudaRun from './pages/MasudaRun'
import Shops from './pages/Shops'
import Home from './pages/Home'

export default function App() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0, pb: { xs: 12, sm: 12 } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/run" element={<MasudaRun />} />
          <Route path="/shops" element={<Shops />} />
        </Routes>
        {/* ページ毎の固有要素は各ページ側で配置 */}
      </Container>
      <BottomTabs />
      <Footer />
    </Box>
  )
}
