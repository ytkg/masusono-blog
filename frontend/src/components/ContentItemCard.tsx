import Typography, { type TypographyProps } from "@mui/material/Typography"
import { styled } from "@mui/material/styles"
import type { SxProps, Theme } from "@mui/material/styles"
import type { ReactNode } from "react"
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom"
import { mergeSx } from "@/utils/sx"
import ContentCard from "./ContentCard"

interface ContentItemCardProps {
  title: ReactNode
  titleVariant?: TypographyProps["variant"]
  titleComponent?: TypographyProps["component"]
  titleSx?: SxProps<Theme>
  titleTo?: string
  titleState?: unknown
  meta?: ReactNode
  metaParts?: string[]
  metaSeparator?: string
  metaSx?: SxProps<Theme>
  children: ReactNode
  sx?: SxProps<Theme>
}

const ContentItemTitleLink = styled(RouterLink)<RouterLinkProps>(({ theme }) => ({
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
  titleState,
  meta,
  metaParts,
  metaSeparator = " ",
  metaSx,
  children,
  sx,
}: ContentItemCardProps) {
  const normalizedMetaParts = (metaParts ?? []).map((part) => part.trim()).filter((part) => part.length > 0)
  const resolvedMeta = meta ?? (normalizedMetaParts.length ? normalizedMetaParts.join(metaSeparator) : undefined)

  return (
    <ContentCard sx={sx}>
      <Typography
        variant={titleVariant}
        component={titleComponent}
        gutterBottom
        sx={mergeSx({ fontWeight: 700 }, titleSx)}
      >
        {titleTo ? (
          <ContentItemTitleLink to={titleTo} state={titleState}>
            {title}
          </ContentItemTitleLink>
        ) : (
          title
        )}
      </Typography>
      {resolvedMeta ? (
        <Typography variant="body2" color="text.secondary" sx={mergeSx({ mb: 2 }, metaSx)}>
          {resolvedMeta}
        </Typography>
      ) : null}
      {children}
    </ContentCard>
  )
}
