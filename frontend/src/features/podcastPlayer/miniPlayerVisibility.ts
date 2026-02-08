interface MiniPlayerVisibilityParams {
  pathname: string
  currentEpisodeId: string | null
  visibleEpisodeId: string | null
}

export function shouldShowMiniPlayer({ pathname, currentEpisodeId, visibleEpisodeId }: MiniPlayerVisibilityParams) {
  if (!currentEpisodeId) return false
  if (!pathname.startsWith("/podcast")) return true
  return visibleEpisodeId !== currentEpisodeId
}
