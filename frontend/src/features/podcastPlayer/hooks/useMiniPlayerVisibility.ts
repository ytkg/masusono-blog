import { useMemo } from "react"
import { getMiniPlayerVisibility, type MiniPlayerVisibilityParams } from "@/features/podcastPlayer/miniPlayerVisibility"

export function useMiniPlayerVisibility({ currentEpisodeId }: MiniPlayerVisibilityParams) {
  return useMemo(() => getMiniPlayerVisibility({ currentEpisodeId }), [currentEpisodeId])
}
