import Box from "@mui/material/Box"
import type { SxProps, Theme } from "@mui/material/styles"
import type { ReactNode } from "react"
import { mergeSx } from "../utils/sx"

interface ContentCardProps {
  children: ReactNode
  sx?: SxProps<Theme>
}

export default function ContentCard({ children, sx }: ContentCardProps) {
  const mergedSx = mergeSx(
    {
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      p: { xs: 2, sm: 2.5 },
      bgcolor: "background.paper",
    },
    sx,
  )

  return <Box sx={mergedSx}>{children}</Box>
}
