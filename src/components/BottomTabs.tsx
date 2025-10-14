import { useLocation, useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import ArticleIcon from '@mui/icons-material/MenuBook'
import PodcastIcon from '@mui/icons-material/Podcasts'
import GameIcon from '@mui/icons-material/SportsEsports'
import PlaceIcon from '@mui/icons-material/Place'

export default function BottomTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const value: 'home' | 'blog' | 'podcast' | 'run' | 'shops' = path.startsWith('/podcast')
    ? 'podcast'
    : path.startsWith('/run')
    ? 'run'
    : path.startsWith('/shops')
    ? 'shops'
    : path.startsWith('/blog')
    ? 'blog'
    : 'home'

  return (
    <Paper square sx={{ position: 'fixed', left: 0, bottom: 36, width: '100%', zIndex: (t) => t.zIndex.appBar, borderTop: '1px solid', borderColor: 'divider' }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, v: 'home' | 'blog' | 'podcast' | 'run' | 'shops') => {
          if (v === 'home') navigate('/')
          else if (v === 'blog') navigate('/blog')
          else if (v === 'podcast') navigate('/podcast')
          else if (v === 'run') navigate('/run')
          else navigate('/shops')
        }}
        sx={{
          '.MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
          },
          '.MuiBottomNavigationAction-label': {
            whiteSpace: 'nowrap',
          },
        }}
      >
        <BottomNavigationAction label="ホーム" value="home" icon={<HomeIcon />} />
        <BottomNavigationAction label="ブログ" value="blog" icon={<ArticleIcon />} />
        <BottomNavigationAction label="ポッドキャスト" value="podcast" icon={<PodcastIcon />} />
        <BottomNavigationAction label="増田ラン" value="run" icon={<GameIcon />} />
        <BottomNavigationAction label="推し店" value="shops" icon={<PlaceIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
