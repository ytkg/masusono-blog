import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        textAlign: 'center',
        mt: 'auto',
        bgcolor: 'primary.main',
        color: 'common.white',
      }}
    >
      <Typography variant="body2" color="inherit">
        © {year} 増田とその他！
      </Typography>
    </Box>
  )
}
