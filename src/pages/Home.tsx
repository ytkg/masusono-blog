import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import { Link as RouterLink } from 'react-router-dom'
import Chip from '@mui/material/Chip'
import { getTodayHoroscope } from '../utils/horoscope'

const featureLinks = [
  { label: 'ブログ', description: '最新の記事やお知らせはこちら', to: '/blog' },
  { label: 'ポッドキャスト', description: '番組のアーカイブを毎週更新', to: '/podcast' },
  { label: '増田ラン', description: 'タップで遊べるランゲーム', to: '/run' },
  { label: '推し店', description: 'おすすめスポットをマップで紹介', to: '/shops' },
]

const sectionStyle = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const

export default function Home() {
  const [now, setNow] = useState(() => new Date())
  const { key: horoscopeDate, entries: horoscopeEntries } = getTodayHoroscope()
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const formatted = now.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 } }}>
      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          ようこそ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {formatted}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ブログやポッドキャスト、ちょっとしたゲームまで。最新のコンテンツをまとめてチェックできます。
        </Typography>
      </Box>

      <Stack spacing={2}>
        {featureLinks.map((item) => (
          <Paper
            key={item.to}
            component={RouterLink}
            to={item.to}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            <Typography variant="h6" component="h3">
              {item.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Paper>
        ))}

        {horoscopeEntries.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" component="h3">増田の星座占い</Typography>
              <Typography variant="body2" color="text.secondary">{horoscopeDate}</Typography>
            </Box>
            <Box sx={{ overflowX: 'auto', pt: 1, pb: 0.5 }}>
              <Stack direction="row" spacing={2} sx={{ minWidth: 'max-content', pr: { xs: 1.5, sm: 0 } }}>
                {horoscopeEntries.map((entry) => (
                  <Paper
                    key={entry.sign}
                    variant="outlined"
                    sx={{
                      width: {
                        xs: 'clamp(260px, 85vw, 320px)',
                        sm: 360,
                        md: 380,
                      },
                      flexShrink: 0,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.2,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {`第${entry.rank}位 ${entry.sign}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entry.content}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip size="small" label={`総合運 ${entry.total}`} />
                      <Chip size="small" label={`恋愛運 ${entry.love}`} />
                      <Chip size="small" label={`仕事運 ${entry.job}`} />
                      <Chip size="small" label={`金運 ${entry.money}`} />
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        rowGap: 1,
                      }}
                    >
                      <Chip size="small" label={`ラッキーアイテム: ${entry.item}`} />
                      <Chip size="small" label={`カラー: ${entry.color}`} />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Paper>
        )}
      </Stack>
    </Box>
  )
}
