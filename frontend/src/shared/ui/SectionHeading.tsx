import Typography, { type TypographyProps } from "@mui/material/Typography"
import type { SxProps, Theme } from "@mui/material/styles"
import type { ReactNode } from "react"
import { mergeSx } from "@/shared/lib/sx"

interface SectionHeadingProps {
  children: ReactNode
  variant?: TypographyProps["variant"]
  component?: TypographyProps["component"]
  gutterBottom?: boolean
  sx?: SxProps<Theme>
}

export default function SectionHeading({
  children,
  variant = "h5",
  component = "h2",
  gutterBottom = true,
  sx,
}: SectionHeadingProps) {
  return (
    <Typography
      variant={variant}
      component={component}
      gutterBottom={gutterBottom}
      sx={mergeSx({ fontWeight: 700 }, sx)}
    >
      {children}
    </Typography>
  )
}
