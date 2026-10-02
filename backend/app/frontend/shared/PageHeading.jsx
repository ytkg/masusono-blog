import Typography from "@mui/material/Typography"
import { titleTextSx } from "./typographyStyles"

export default function PageHeading({ children }) {
  return (
    <Typography
      variant="h5"
      component="h1"
      sx={{ ...titleTextSx, mb: 3, pb: 3, borderBottom: "3px solid", borderColor: "text.primary" }}
    >
      {children}
    </Typography>
  )
}
