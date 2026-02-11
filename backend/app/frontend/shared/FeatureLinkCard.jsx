import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { Link } from "@inertiajs/react"

export default function FeatureLinkCard({ title, description, href, children, sx }) {
  return (
    <Paper
      component={Link}
      href={href}
      prefetch
      variant="outlined"
      sx={[
        {
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
          textDecoration: "none",
          color: "inherit",
        },
        sx,
      ]}
    >
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
