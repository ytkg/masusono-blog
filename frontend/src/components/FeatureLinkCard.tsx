import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import type { ReactNode } from "react"
import { Link as RouterLink } from "react-router-dom"
import type { SxProps, Theme } from "@mui/material/styles"
import { mergeSx } from "@/shared/lib/sx"

interface FeatureLinkCardProps {
  title: string
  description: string
  to: string
  children?: ReactNode
  sx?: SxProps<Theme>
}

export default function FeatureLinkCard({ title, description, to, children, sx }: FeatureLinkCardProps) {
  const mergedSx: SxProps<Theme> = mergeSx(
    {
      p: { xs: 2, sm: 2.5 },
      display: "flex",
      flexDirection: "column",
      gap: 1,
      textDecoration: "none",
      color: "inherit",
    },
    sx,
  )

  return (
    <Paper component={RouterLink} to={to} variant="outlined" sx={mergedSx}>
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
      {children}
    </Paper>
  )
}
