import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        pb: 1,
        width: '100%',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        color: 'common.white',
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <Typography variant="body2" color="inherit">
        © {year} 増田とその他！
      </Typography>
    </Box>
  )
}
