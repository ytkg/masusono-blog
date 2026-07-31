const NARROW_VIEWPORT_MAX_WIDTH = 720
const NARROW_COLUMN_WIDTH = 58
const DEFAULT_COLUMN_WIDTH = 72
const MIN_COLUMN_GAP = 12
const MAX_COLUMN_GAP = 22

function columnGapFor(viewportWidth, isNarrow) {
  if (isNarrow) return MIN_COLUMN_GAP

  return Math.min(MAX_COLUMN_GAP, Math.max(MIN_COLUMN_GAP, viewportWidth * 0.018))
}

export function sentenceFeedLayout({ containerWidth, itemHeights, viewportWidth }) {
  const isNarrow = viewportWidth <= NARROW_VIEWPORT_MAX_WIDTH
  const preferredColumnWidth = isNarrow ? NARROW_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH
  const gap = columnGapFor(viewportWidth, isNarrow)
  const columnCount = Math.max(1, Math.floor((containerWidth + gap) / (preferredColumnWidth + gap)))
  const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount
  const columnHeights = Array.from({ length: columnCount }, () => 0)

  const items = itemHeights.map((height) => {
    const columnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    const top = columnHeights[columnIndex]
    columnHeights[columnIndex] += height + gap

    return { left: columnIndex * (columnWidth + gap), top, width: columnWidth }
  })

  return { height: Math.max(...columnHeights) - gap, items }
}
