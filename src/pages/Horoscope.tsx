import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
// 日付選択は行わず、今日のみ表示
import data from '../assets/horoscope.json'

type Entry = {
  sign: string
  content: string
  item: string
  color: string
  rank: number
  total: number
  love: number
  money: number
  job: number
}

type DataShape = {
  horoscope: Record<string, Entry[]>
}

const H: DataShape = data as unknown as DataShape

function todayKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${da}`
}

export default function Horoscope() {
  const today = todayKey()
  const entries = useMemo(() => {
    const list = (H.horoscope?.[today] || []) as Entry[]
    return [...list].sort((a, b) => a.rank - b.rank)
  }, [])

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" component="h2">増田の星座占い</Typography>
        <Typography variant="body2" color="text.secondary">{today}</Typography>
      </Box>

      {entries.length === 0 && (
        <Typography>調整中！</Typography>
      )}

      {entries.length > 0 && (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {entries.slice(0, 3).map((e) => (
          <Grid key={e.sign} size={{ xs: 12, sm: 4 }}>
            <Card sx={{ border: '2px solid', borderColor: e.rank === 1 ? 'goldenrod' : e.rank === 2 ? 'silver' : '#cd7f32' }}>
              <CardContent>
                <Typography variant="h6">{`第${e.rank}位 ${e.sign}`}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{e.content}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip size="small" label={`総合運 ${e.total}`} />
                  <Chip size="small" label={`恋愛運 ${e.love}`} />
                  <Chip size="small" label={`仕事運 ${e.job}`} />
                  <Chip size="small" label={`金運 ${e.money}`} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`ラッキーアイテム: ${e.item}`} />
                  <Chip size="small" label={`カラー: ${e.color}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      {entries.length > 0 && (
      <Grid container spacing={2}>
        {entries.slice(3).map((e) => (
          <Grid key={e.sign} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{`第${e.rank}位 ${e.sign}`}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{e.content}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip size="small" label={`総合運 ${e.total}`} />
                  <Chip size="small" label={`恋愛運 ${e.love}`} />
                  <Chip size="small" label={`仕事運 ${e.job}`} />
                  <Chip size="small" label={`金運 ${e.money}`} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`ラッキーアイテム: ${e.item}`} />
                  <Chip size="small" label={`カラー: ${e.color}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </Box>
  )
}
