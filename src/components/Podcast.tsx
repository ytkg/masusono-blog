import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

export default function Podcast() {
  return (
    <Box component="section" sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        ポッドキャスト
      </Typography>
      <Alert severity="info">準備中です。</Alert>
    </Box>
  )
}

