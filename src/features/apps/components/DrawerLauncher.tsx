import { useId, useState, type ReactNode } from 'react'
import AppsIcon from '@mui/icons-material/Apps'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

export interface DrawerLauncherProps {
  title: string
  buttonAriaLabel: string
  children: ReactNode
  buttonSx?: SxProps<Theme>
  buttonIcon?: ReactNode
  paperSx?: SxProps<Theme>
}

export default function DrawerLauncher({
  title,
  buttonAriaLabel,
  children,
  buttonSx,
  buttonIcon,
  paperSx,
}: DrawerLauncherProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const iconBaseSx: SxProps<Theme> = {
    borderRadius: 2,
    width: 56,
    height: 56,
    bgcolor: 'common.black',
    color: 'common.white',
    '&:hover': {
      bgcolor: 'common.black',
    },
  }
  const iconSx: SxProps<Theme> = buttonSx ? ([iconBaseSx, buttonSx] as SxProps<Theme>) : iconBaseSx
  const paperBaseSx: SxProps<Theme> = {
    height: '100dvh',
    width: '100%',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }
  const paperCombinedSx: SxProps<Theme> = paperSx ? ([paperBaseSx, paperSx] as SxProps<Theme>) : paperBaseSx

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <IconButton aria-label={buttonAriaLabel} onClick={() => setOpen(true)} sx={iconSx}>
          {buttonIcon ?? <AppsIcon />}
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
          {title}
        </Typography>
      </Box>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={titleId}
        PaperProps={{ sx: paperCombinedSx }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography id={titleId} variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <IconButton aria-label="閉じる" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>{open ? children : null}</Box>
        </Box>
      </Drawer>
    </Box>
  )
}
