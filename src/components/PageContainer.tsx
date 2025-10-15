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
  return (
    <Box component={component} id={id} sx={[{ px: { xs: 2, sm: 3 }, py: 2 }, sx]}>
      {children}
    </Box>
  )
}
