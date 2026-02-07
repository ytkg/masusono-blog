import Skeleton from "@mui/material/Skeleton"
import type { SxProps, Theme } from "@mui/material/styles"
import ContentCard from "./ContentCard"

interface ContentCardSkeletonProps {
  titleWidth?: number | string
  subtitleWidth?: number | string
  mediaHeight?: number
  sx?: SxProps<Theme>
}

export default function ContentCardSkeleton({
  titleWidth = "80%",
  subtitleWidth,
  mediaHeight,
  sx,
}: ContentCardSkeletonProps) {
  return (
    <ContentCard sx={sx}>
      <Skeleton variant="text" width={titleWidth} height={28} />
      {subtitleWidth ? <Skeleton variant="text" width={subtitleWidth} /> : null}
      {mediaHeight ? <Skeleton variant="rectangular" height={mediaHeight} sx={{ mt: 1 }} /> : null}
    </ContentCard>
  )
}
