import Typography from "@mui/material/Typography"

export default function SectionHeading({ children, variant = "h5", component = "h2", gutterBottom = true, sx }) {
  return (
    <Typography variant={variant} component={component} gutterBottom={gutterBottom} sx={[{ fontWeight: 700 }, sx]}>
      {children}
    </Typography>
  )
}
