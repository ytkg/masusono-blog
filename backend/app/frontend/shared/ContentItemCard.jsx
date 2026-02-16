import { Link } from "@inertiajs/react"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"
import ContentCard from "./ContentCard"

const ContentItemTitleLink = styled(Link)(({ theme }) => ({
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
  metaSx,
  children,
  sx,
}) {
  const normalizedMetaParts = (metaParts ?? []).map((part) => String(part).trim()).filter((part) => part.length > 0)
  const resolvedMeta = meta ?? (normalizedMetaParts.length ? normalizedMetaParts.join(metaSeparator) : undefined)

  return (
    <ContentCard sx={sx}>
      <Typography variant={titleVariant} component={titleComponent} gutterBottom sx={[{ fontWeight: 700 }, titleSx]}>
        {titleTo ? (
          <ContentItemTitleLink href={titleTo} prefetch>
            {title}
          </ContentItemTitleLink>
        ) : (
          title
        )}
      </Typography>
      {resolvedMeta ? (
        <Typography variant="body2" color="text.secondary" sx={[{ mb: 2 }, metaSx]}>
          {resolvedMeta}
        </Typography>
      ) : null}
      {children}
    </ContentCard>
  )
}
