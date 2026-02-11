import { useMemo } from "react"
import { getMiniPlayerVisibility } from "../miniPlayerVisibility"

export function useMiniPlayerVisibility({ currentEpisodeId }) {
  return useMemo(() => getMiniPlayerVisibility({ currentEpisodeId }), [currentEpisodeId])
}
