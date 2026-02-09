export interface MiniPlayerVisibilityParams {
  currentEpisodeId: string | null
}

export type MiniPlayerVisibilityReason = "NO_CURRENT_EPISODE" | "HAS_CURRENT_EPISODE"

export interface MiniPlayerVisibilityResult {
  isVisible: boolean
  reason: MiniPlayerVisibilityReason
}

export function getMiniPlayerVisibility({
  currentEpisodeId,
}: MiniPlayerVisibilityParams): MiniPlayerVisibilityResult {
  if (!currentEpisodeId) {
    return { isVisible: false, reason: "NO_CURRENT_EPISODE" }
  }
  return { isVisible: true, reason: "HAS_CURRENT_EPISODE" }
}

export function shouldShowMiniPlayer(params: MiniPlayerVisibilityParams) {
  return getMiniPlayerVisibility(params).isVisible
}
