export interface MiniPlayerVisibilityParams {
  pathname: string
  currentEpisodeId: string | null
  visibleEpisodeId: string | null
}

export type MiniPlayerVisibilityReason =
  | "NO_CURRENT_EPISODE"
  | "NON_PODCAST_ROUTE"
  | "CURRENT_EPISODE_VISIBLE"
  | "CURRENT_EPISODE_NOT_VISIBLE"

export interface MiniPlayerVisibilityResult {
  isVisible: boolean
  reason: MiniPlayerVisibilityReason
}

export function getMiniPlayerVisibility({
  pathname,
  currentEpisodeId,
  visibleEpisodeId,
}: MiniPlayerVisibilityParams): MiniPlayerVisibilityResult {
  if (!currentEpisodeId) {
    return { isVisible: false, reason: "NO_CURRENT_EPISODE" }
  }
  if (!pathname.startsWith("/podcast")) {
    return { isVisible: true, reason: "NON_PODCAST_ROUTE" }
  }
  if (visibleEpisodeId === currentEpisodeId) {
    return { isVisible: false, reason: "CURRENT_EPISODE_VISIBLE" }
  }
  return { isVisible: true, reason: "CURRENT_EPISODE_NOT_VISIBLE" }
}

export function shouldShowMiniPlayer(params: MiniPlayerVisibilityParams) {
  return getMiniPlayerVisibility(params).isVisible
}
