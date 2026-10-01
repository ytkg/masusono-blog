import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

export default function LoadingStatus({ children }) {
  return (
    <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CircularProgress size={16} color="inherit" aria-hidden="true" />
      <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.5 }}>{children}</Typography>
    </Box>
  )
}
