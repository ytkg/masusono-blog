interface MiniPlayerVisibilityParams {
  pathname: string
  currentEpisodeId: string | null
  visibleEpisodeIds: ReadonlySet<string>
}

export function shouldShowMiniPlayer({ pathname, currentEpisodeId, visibleEpisodeIds }: MiniPlayerVisibilityParams) {
  if (!currentEpisodeId) return false
  if (!pathname.startsWith("/podcast")) return true
  return !visibleEpisodeIds.has(currentEpisodeId)
}
