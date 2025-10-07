import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

export default function Header() {
  return (
    <AppBar position="sticky" color="primary" enableColorOnDark>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
          増田とその他！
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
