import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Link } from "@inertiajs/react"

export default function FeatureLinkCard({ title, description, href, icon, children, sx }) {
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon ? (
          <Box
            aria-hidden="true"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
              color: "text.primary",
              "& .MuiSvgIcon-root": {
                fontSize: 34,
              },
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ChevronRightIcon aria-hidden="true" sx={{ flex: "0 0 auto", color: "text.secondary", fontSize: 28 }} />
      </Box>
      {children}
    </Paper>
  )
}
