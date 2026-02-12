import useSWR from "swr"
import { fetchJson } from "../../../shared/lib/fetchJson"

const EPISODES_ENDPOINT = "/api/podcast/episodes.json"

export default function useEpisodes() {
  const { data, error, isLoading } = useSWR(EPISODES_ENDPOINT, fetchJson)
  const episodes = Array.isArray(data?.episodes) ? data.episodes : []

  return {
    episodes,
    error,
    isLoading,
  }
}
