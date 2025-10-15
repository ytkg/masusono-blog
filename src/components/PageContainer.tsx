import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode, ElementType } from 'react'

interface PageContainerProps {
  children: ReactNode
  component?: ElementType
  id?: string
  sx?: SxProps<Theme>
}

export default function PageContainer({ children, component = 'section', id, sx }: PageContainerProps) {
  const mergedSx: SxProps<Theme> = [
    { px: { xs: 2, sm: 3 }, py: 2 },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ]

  return (
    <Box component={component} id={id} sx={mergedSx}>
      {children}
    </Box>
  )
}
