import Typography from "@mui/material/Typography"

export default function PageHeading({ children }) {
  return (
    <Typography
      variant="h5"
      component="h1"
      sx={{
        fontFamily: '"Yu Mincho", "Hiragino Mincho ProN", serif',
        fontSize: { xs: 38, sm: 52 },
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: "-0.05em",
        mb: 3,
        py: 2,
      }}
    >
      {children}
    </Typography>
  )
}
