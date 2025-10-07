import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import type { SxProps, Theme } from '@mui/material/styles'
import defaultImage from '../assets/aimi.png'

interface Props {
  src?: string
  alt?: string
  onClick?: () => void
  height?: number | string | { xs?: number | string; sm?: number | string; md?: number | string }
  sx?: SxProps<Theme>
}

export default function FooterImage({
  src = defaultImage,
  alt = '',
  onClick,
  height = { xs: 112, sm: 128 },
  sx,
}: Props) {
  const Img = (
    <Box component="img" src={src} alt={alt} sx={{ height, display: 'block' }} />
  )

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', ...sx }}>
      {onClick ? (
        <ButtonBase onClick={onClick} focusRipple sx={{ p: 0, borderRadius: 1 }} aria-label={alt || undefined}>
          {Img}
        </ButtonBase>
      ) : (
        Img
      )}
    </Box>
  )
}

