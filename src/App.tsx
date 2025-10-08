import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from './components/Header'
import Footer from './components/Footer'
import Blog from './components/Blog'
import './App.css'
import FooterImage from './components/FooterImage'

export default function App() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0 }}>
        <Blog />
      </Container>
      {/* コンテンツとフッターの間に画像（コンポーネント化） */}
      <FooterImage />
      <Footer />
    </Box>
  )
}
