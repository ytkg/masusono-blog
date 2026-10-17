export function parseArticleTags(tags) {
  return [
    ...new Set(
      String(tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ]
}
