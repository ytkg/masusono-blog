import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

export default function Header() {
  return (
    <AppBar
      position="sticky"
      color="primary"
      enableColorOnDark
      sx={{ minHeight: { xs: 48, sm: 56 } }}
    >
      <Toolbar sx={{ justifyContent: 'center', minHeight: { xs: 48, sm: 56 } }}>
        <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
          増田とその他！
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
