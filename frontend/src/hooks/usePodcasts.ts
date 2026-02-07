import useSWR from "swr"
import { API_BASE } from "../constants"
import type { PodcastEpisode } from "../types/podcast"

const fetcher = async (url: string): Promise<PodcastEpisode[]> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`APIリクエスト失敗: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as PodcastEpisode[]
}

export function usePodcasts() {
  return useSWR<PodcastEpisode[]>(`${API_BASE}/podcasts.json`, fetcher, {
    revalidateOnFocus: false,
  })
}
