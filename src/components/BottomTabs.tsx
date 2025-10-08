import { useLocation, useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import ArticleIcon from '@mui/icons-material/MenuBook'
import PodcastIcon from '@mui/icons-material/Podcasts'
import GameIcon from '@mui/icons-material/SportsEsports'

export default function BottomTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const value: 'blog' | 'podcast' | 'run' = location.pathname.startsWith('/podcast')
    ? 'podcast'
    : location.pathname.startsWith('/run')
    ? 'run'
    : 'blog'

  return (
    <Paper square sx={{ position: 'fixed', left: 0, bottom: 44, width: '100%', zIndex: (t) => t.zIndex.appBar, borderTop: '1px solid', borderColor: 'divider' }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, v: 'blog' | 'podcast' | 'run') => {
          if (v === 'blog') navigate('/')
          else if (v === 'podcast') navigate('/podcast')
          else navigate('/run')
        }}
      >
        <BottomNavigationAction label="ブログ" value="blog" icon={<ArticleIcon />} />
        <BottomNavigationAction label="ポッドキャスト" value="podcast" icon={<PodcastIcon />} />
        <BottomNavigationAction label="増田ラン" value="run" icon={<GameIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
