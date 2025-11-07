import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'

import logo from '../assets/logo.png'

export default function Header() {
  return (
    <AppBar
      position="sticky"
      color="primary"
      enableColorOnDark
      sx={{ minHeight: { xs: 48, sm: 56 } }}
    >
      <Toolbar sx={{ justifyContent: 'center', minHeight: { xs: 48, sm: 56 } }}>
        <Box
          component="img"
          src={logo}
          alt="増田とその他！"
          sx={{
            height: { xs: 36, sm: 44 },
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </Toolbar>
    </AppBar>
  )
}
