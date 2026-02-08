import Box from "@mui/material/Box"
import type { SxProps, Theme } from "@mui/material/styles"
import ContentCardSkeleton, { type ContentCardSkeletonProps } from "./ContentCardSkeleton"

interface ContentCardSkeletonListProps {
  count?: number
  itemProps?: ContentCardSkeletonProps
  sx?: SxProps<Theme>
}

export default function ContentCardSkeletonList({ count = 3, itemProps, sx }: ContentCardSkeletonListProps) {
  const customSx = Array.isArray(sx) ? sx : sx ? [sx] : []
  const skeletonKeys = Array.from({ length: count }, (_, index) => `content-card-skeleton-${index}`)

  return (
    <Box sx={[{ display: "grid", gap: 2 }, ...customSx]}>
      {skeletonKeys.map((key) => (
        <ContentCardSkeleton key={key} {...itemProps} />
      ))}
    </Box>
  )
}
