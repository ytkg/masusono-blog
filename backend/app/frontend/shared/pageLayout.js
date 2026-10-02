export const PAGE_MAX_WIDTH = 1200
export const PAGE_HORIZONTAL_PADDING = { xs: 2, sm: 3 }
export const PAGE_INNER_MAX_WIDTH = PAGE_MAX_WIDTH - 24 * 2

export const NAVIGATION_CONTENT_HEIGHT = 56
export const NAVIGATION_VERTICAL_PADDING = 4
export const NAVIGATION_BORDER_WIDTH = 1
export const NAVIGATION_HEIGHT =
  NAVIGATION_CONTENT_HEIGHT + NAVIGATION_VERTICAL_PADDING * 2 + NAVIGATION_BORDER_WIDTH * 2
export const NAVIGATION_BOTTOM_MARGIN = { xs: 16, sm: 20 }
export const NAVIGATION_NOTICE_GAP = 8
export const navigationBottomSx = Object.fromEntries(
  Object.entries(NAVIGATION_BOTTOM_MARGIN).map(([breakpoint, margin]) => [
    breakpoint,
    `calc(${margin}px + env(safe-area-inset-bottom))`,
  ]),
)
export const navigationNoticeBottomSx = Object.fromEntries(
  Object.entries(NAVIGATION_BOTTOM_MARGIN).map(([breakpoint, margin]) => [
    breakpoint,
    `calc(${margin + NAVIGATION_HEIGHT + NAVIGATION_NOTICE_GAP}px + env(safe-area-inset-bottom))`,
  ]),
)

export const HEADER_HEIGHT = { xs: 64, sm: 80 }
export const HEADER_TOOLBAR_HEIGHT = Object.fromEntries(
  Object.entries(HEADER_HEIGHT).map(([breakpoint, height]) => [breakpoint, height - 1]),
)

export const CONTENT_STICKY_TOP = { xs: HEADER_HEIGHT.xs + 48, sm: HEADER_HEIGHT.sm + 48, lg: HEADER_HEIGHT.sm }
