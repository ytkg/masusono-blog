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
  meta,
  metaParts,
  metaSeparator = " ",
  metaPlacement = "below",
  metaSx,
  action,
  children,
  sx,
}) {
  const normalizedMetaParts = (metaParts ?? [])
    .filter((part) => part !== null && part !== undefined)
    .map((part) => String(part).trim())
    .filter((part) => part.length > 0)
  const resolvedMeta = meta ?? (normalizedMetaParts.length ? normalizedMetaParts.join(metaSeparator) : undefined)
  return (
    <Box sx={[{ position: "relative" }, sx]}>
      {action ? <Box sx={{ position: "absolute", top: 0, right: 0 }}>{action}</Box> : null}
      {resolvedMeta && metaPlacement === "above" ? (
        <Typography variant="body2" color="text.secondary" sx={[{ mb: 0.75, pr: action ? 5 : 0 }, metaSx]}>
          {resolvedMeta}
        </Typography>
      ) : null}
      <Typography
        variant={titleVariant}
        component={titleComponent}
        gutterBottom
        sx={[{ fontWeight: 700, pr: action ? 5 : 0 }, titleSx]}
      >
        {titleTo ? (
          <ContentItemTitleLink href={titleTo} prefetch>
            {title}
          </ContentItemTitleLink>
        ) : (
          title
        )}
      </Typography>
      {resolvedMeta && metaPlacement === "below" ? (
        <Typography variant="body2" color="text.secondary" sx={[{ mb: 2, pr: action ? 5 : 0 }, metaSx]}>
          {resolvedMeta}
        </Typography>
      ) : null}
      {children}
    </Box>
  )
}
