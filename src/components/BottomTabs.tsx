import { useLocation, useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import ArticleIcon from '@mui/icons-material/MenuBook'
import PodcastIcon from '@mui/icons-material/Podcasts'
import GameIcon from '@mui/icons-material/SportsEsports'
import StarsIcon from '@mui/icons-material/Stars'
import PlaceIcon from '@mui/icons-material/Place'

export default function BottomTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const value: 'blog' | 'podcast' | 'run' | 'horoscope' | 'shops' = location.pathname.startsWith('/podcast')
    ? 'podcast'
    : location.pathname.startsWith('/run')
    ? 'run'
    : location.pathname.startsWith('/horoscope')
    ? 'horoscope'
    : location.pathname.startsWith('/shops')
    ? 'shops'
    : 'blog'

  return (
    <Paper square sx={{ position: 'fixed', left: 0, bottom: 36, width: '100%', zIndex: (t) => t.zIndex.appBar, borderTop: '1px solid', borderColor: 'divider' }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, v: 'blog' | 'podcast' | 'run' | 'horoscope' | 'shops') => {
          if (v === 'blog') navigate('/')
          else if (v === 'podcast') navigate('/podcast')
          else if (v === 'run') navigate('/run')
          else if (v === 'horoscope') navigate('/horoscope')
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
        <BottomNavigationAction label="ブログ" value="blog" icon={<ArticleIcon />} />
        <BottomNavigationAction label="ポッドキャスト" value="podcast" icon={<PodcastIcon />} />
        <BottomNavigationAction label="増田ラン" value="run" icon={<GameIcon />} />
        <BottomNavigationAction label="星座占い" value="horoscope" icon={<StarsIcon />} />
        <BottomNavigationAction label="推し店" value="shops" icon={<PlaceIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
