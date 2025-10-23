import type { ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import ArticleIcon from '@mui/icons-material/MenuBook'
import PodcastIcon from '@mui/icons-material/Podcasts'
import GameIcon from '@mui/icons-material/SportsEsports'
import PlaceIcon from '@mui/icons-material/Place'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type TabValue = 'home' | 'blog' | 'podcast' | 'games' | 'shops'

const TABS: Array<{ value: TabValue; label: string; to: string; icon: ReactElement }> = [
  { value: 'home', label: 'ホーム', to: '/', icon: <HomeIcon /> },
  { value: 'blog', label: 'ブログ', to: '/blog', icon: <ArticleIcon /> },
  { value: 'podcast', label: 'ポッドキャスト', to: '/podcast', icon: <PodcastIcon /> },
  { value: 'games', label: '増田ゲーム', to: '/games', icon: <GameIcon /> },
  { value: 'shops', label: '推し店', to: '/shops', icon: <PlaceIcon /> },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const active = TABS.find((tab) => tab.to !== '/' && path.startsWith(tab.to))?.value ?? 'home'

  return (
    <Paper
      component="footer"
      square
      sx={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: (t) => t.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        showLabels
        value={active}
        onChange={(_, value: TabValue) => {
          const tab = TABS.find((item) => item.value === value)
          if (tab) navigate(tab.to)
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
        {TABS.map((tab) => (
          <BottomNavigationAction key={tab.value} label={tab.label} value={tab.value} icon={tab.icon} />
        ))}
      </BottomNavigation>
      <Box
        sx={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'common.white',
        }}
      >
        <Typography variant="body2" color="inherit">
          © {year} 増田とその他！
        </Typography>
      </Box>
    </Paper>
  )
}
