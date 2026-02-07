import useSWR from "swr"
import { API_BASE } from "../constants"
import type { PodcastEpisode } from "../types/podcast"
import { fetchJson } from "../utils/fetchJson"

export function usePodcasts() {
  return useSWR<PodcastEpisode[]>(`${API_BASE}/podcasts.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
