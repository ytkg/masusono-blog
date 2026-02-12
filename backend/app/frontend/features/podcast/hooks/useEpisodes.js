import useSWR from "swr"

const EPISODES_ENDPOINT = "/api/podcast/episodes.json"

const fetcher = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`)
  }
  return response.json()
}

export default function useEpisodes() {
  const { data, error, isLoading } = useSWR(EPISODES_ENDPOINT, fetcher)
  const episodes = Array.isArray(data?.episodes) ? data.episodes : []

  return {
    episodes,
    error,
    isLoading,
  }
}
