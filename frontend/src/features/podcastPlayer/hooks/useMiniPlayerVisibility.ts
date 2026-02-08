import { useMemo } from "react"
import { getMiniPlayerVisibility, type MiniPlayerVisibilityParams } from "@/features/podcastPlayer/miniPlayerVisibility"

export function useMiniPlayerVisibility({ pathname, currentEpisodeId, visibleEpisodeId }: MiniPlayerVisibilityParams) {
  return useMemo(
    () =>
      getMiniPlayerVisibility({
        pathname,
        currentEpisodeId,
        visibleEpisodeId,
      }),
    [pathname, currentEpisodeId, visibleEpisodeId],
  )
}
