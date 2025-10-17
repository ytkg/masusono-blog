import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import { getTodayHoroscope } from '../utils/horoscope'
import FeatureLinkCard from '../components/FeatureLinkCard'

const featureLinks = [
  { label: 'ブログ', description: '最新の記事やお知らせはこちら', to: '/blog' },
  { label: 'ポッドキャスト', description: '番組のアーカイブを毎週更新', to: '/podcast' },
  { label: '増田ゲーム', description: 'ミニゲームで遊べるコーナー', to: '/games' },
  { label: '推し店', description: 'おすすめスポットをマップで紹介', to: '/shops' },
]

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
  const masudaBirthday = new Date(2025, 10, 12, 0, 0, 0)
  const diffMs = masudaBirthday.getTime() - now.getTime()
  const DAY_MS = 24 * 60 * 60 * 1000
  const HOUR_MS = 60 * 60 * 1000
  const MINUTE_MS = 60 * 1000
  const countdown = diffMs > 0
    ? {
        days: Math.floor(diffMs / DAY_MS),
        hours: Math.floor((diffMs % DAY_MS) / HOUR_MS),
        minutes: Math.floor((diffMs % HOUR_MS) / MINUTE_MS),
        seconds: Math.floor((diffMs % MINUTE_MS) / 1000),
      }
    : null
  const masudaBirthdayLabel = masudaBirthday.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
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
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography variant="h6" component="h2">増田のバースデーまで</Typography>
            <Typography variant="body2" color="text.secondary">{`（${masudaBirthdayLabel}）`}</Typography>
          </Box>
          {countdown ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: { xs: 1, sm: 2 },
                width: '100%',
              }}
            >
              {[
                { label: '日', value: countdown.days.toString() },
                { label: '時間', value: countdown.hours.toString().padStart(2, '0') },
                { label: '分', value: countdown.minutes.toString().padStart(2, '0') },
                { label: '秒', value: countdown.seconds.toString().padStart(2, '0') },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="span"
                    sx={{ display: 'block', fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
                  >
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
              本日は増田バースデーです！お祝いしましょう。
            </Typography>
          )}
        </Paper>
        {featureLinks.map((item) => (
          <FeatureLinkCard key={item.to} title={item.label} description={item.description} to={item.to} />
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
