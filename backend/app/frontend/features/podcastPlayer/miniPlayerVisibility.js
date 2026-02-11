export function getMiniPlayerVisibility({ currentEpisodeId }) {
  if (!currentEpisodeId) {
    return { isVisible: false, reason: "NO_CURRENT_EPISODE" }
  }
  return { isVisible: true, reason: "HAS_CURRENT_EPISODE" }
}

export function shouldShowMiniPlayer(params) {
  return getMiniPlayerVisibility(params).isVisible
}
