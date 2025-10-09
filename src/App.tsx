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
import Horoscope from './pages/Horoscope'

export default function App() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0, pb: { xs: 14, sm: 14 } }}>
        <Routes>
          <Route path="/" element={<Blog />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/run" element={<MasudaRun />} />
          <Route path="/horoscope" element={<Horoscope />} />
        </Routes>
        {/* ページ毎の固有要素は各ページ側で配置 */}
      </Container>
      <BottomTabs />
      <Footer />
    </Box>
  )
}
