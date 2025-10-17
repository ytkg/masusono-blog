import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

type MasudaBirthdaySectionProps = {
  now: Date
}

const MASUDA_BIRTHDAY = new Date(2025, 10, 12, 0, 0, 0)
const MASUDA_BIRTHDAY_LABEL = MASUDA_BIRTHDAY.toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})
const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const MINUTE_MS = 60 * 1000

export default function MasudaBirthdaySection({ now }: MasudaBirthdaySectionProps) {
  const nowRoundedMs = Math.floor(now.getTime() / 1000) * 1000
  const diffMs = MASUDA_BIRTHDAY.getTime() - nowRoundedMs
  const countdown = diffMs > 0
    ? {
        days: Math.floor(diffMs / DAY_MS),
        hours: Math.floor((diffMs % DAY_MS) / HOUR_MS),
        minutes: Math.floor((diffMs % HOUR_MS) / MINUTE_MS),
        seconds: Math.floor((diffMs % MINUTE_MS) / 1000),
      }
    : null

  return (
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
        <Typography variant="body2" color="text.secondary">{MASUDA_BIRTHDAY_LABEL}</Typography>
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
  )
}
