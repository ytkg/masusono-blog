const GRAPHEMES = new Intl.Segmenter("ja", { granularity: "grapheme" })

// Keep the existing UTF-16 budget, while leaving joined characters intact.
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  let end = 0
  for (const { segment, index } of GRAPHEMES.segment(text)) {
    if (index + segment.length > maxLength) break
    end = index + segment.length
  }
  return text.slice(0, end)
}
