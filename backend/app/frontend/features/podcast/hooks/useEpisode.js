import useEpisodes from "./useEpisodes"

export default function useEpisode(episodeId) {
  const { episodes, error, isLoading } = useEpisodes()
  const episode = episodes.find((item) => item.id === episodeId) ?? null

  return {
    episode,
    error,
    isLoading,
  }
}
