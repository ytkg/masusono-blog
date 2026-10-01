import Typography from "@mui/material/Typography"
import { sectionHeadingTextSx } from "./typographyStyles"

export default function SectionHeading({ children, variant = "h6", component = "h2", gutterBottom = true, sx }) {
  return (
    <Typography
      variant={variant}
      component={component}
      sx={[{ ...sectionHeadingTextSx, mb: gutterBottom ? 2 : 0 }, sx]}
    >
      {children}
    </Typography>
  )
}
