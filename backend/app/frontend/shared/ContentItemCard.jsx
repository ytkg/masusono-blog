import { focusVisibleSx } from "./focusStyles"
import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"

const ContentItemTitleLink = styled(Link)(({ theme }) => ({
  ...focusVisibleSx,
  color: "inherit",
  textDecoration: "none",
  display: "inline-block",
  "&:hover": { textDecoration: "underline" },
  transition: theme.transitions.create("color"),
}))

export default function ContentItemCard({
  title,
  titleVariant = "h6",
  titleComponent = "h2",
  titleSx,
  titleTo,
  children,
  sx,
}) {
  return (
    <Box sx={[{ position: "relative" }, sx]}>
      <Typography variant={titleVariant} component={titleComponent} gutterBottom sx={[{ fontWeight: 700 }, titleSx]}>
        {titleTo ? (
          <ContentItemTitleLink href={titleTo} prefetch>
            {title}
          </ContentItemTitleLink>
        ) : (
          title
        )}
      </Typography>
      {children}
    </Box>
  )
}
