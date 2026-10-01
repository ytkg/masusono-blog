import Typography from "@mui/material/Typography"

export default function PageHeading({ children }) {
  return (
    <Typography
      variant="h5"
      component="h1"
      sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: 0, mb: 3 }}
    >
      {children}
    </Typography>
  )
}
