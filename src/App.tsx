import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from './components/Header'
import Footer from './components/Footer'
import ArticlesList from './components/ArticlesList'
import './App.css'
import ArticleModalRoute from './routes/ArticleModalRoute'
import footerImage from './assets/aimi.png'

export default function App() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0 }}>
        <ArticlesList />
      </Container>
      {/* コンテンツとフッターの間に画像（上下の余白なし） */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box component="img" src={footerImage} alt="" sx={{ height: { xs: 112, sm: 128 } }} />
      </Box>
      {/* URLに /articles/:id が含まれる場合のみモーダルを表示 */}
      <ArticleModalRoute />
      <Footer />
    </Box>
  )
}
