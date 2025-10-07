import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Header from './components/Header'
import Footer from './components/Footer'
import ArticlesList from './components/ArticlesList'
import './App.css'

export default function App() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" disableGutters sx={{ flexGrow: 1, py: 0, px: 0 }}>
        <ArticlesList />
      </Container>
      <Footer />
    </Box>
  )
}
