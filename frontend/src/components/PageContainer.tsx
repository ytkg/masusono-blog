import Box from "@mui/material/Box"
import type { SxProps, Theme } from "@mui/material/styles"
import type { ReactNode, ElementType } from "react"
import { mergeSx } from "../utils/sx"

interface PageContainerProps {
  children: ReactNode
  component?: ElementType
  id?: string
  sx?: SxProps<Theme>
}

export default function PageContainer({ children, component = "section", id, sx }: PageContainerProps) {
  const mergedSx: SxProps<Theme> = mergeSx({ px: { xs: 2, sm: 3 }, py: 2 }, sx)

  return (
    <Box component={component} id={id} sx={mergedSx}>
      {children}
    </Box>
  )
}
