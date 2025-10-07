import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        textAlign: 'center',
        mt: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {year} 増田とその他！
      </Typography>
    </Box>
  )
}
