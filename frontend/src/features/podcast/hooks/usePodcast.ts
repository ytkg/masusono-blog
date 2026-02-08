import { useMemo } from "react"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { usePodcasts } from "./usePodcasts"

export function usePodcast(id?: string | null, fallback?: PodcastEpisode | null) {
  const swr = usePodcasts()
  const { data: episodes, error, isLoading, isValidating, mutate } = swr

  const episode = useMemo(() => {
    if (!id) return fallback ?? null
    const found = episodes?.find((item) => item.id === id)
    return found ?? fallback ?? null
  }, [episodes, id, fallback])

  const resolvedError = useMemo(() => {
    if (error) return error
    if (id && episodes && !episode) {
      return new Error("エピソードが見つかりません。")
    }
    return undefined
  }, [error, id, episodes, episode])

  const resolvedLoading = id ? isLoading || (!episodes && !episode) : false

  return {
    data: episode ?? undefined,
    error: resolvedError,
    isLoading: resolvedLoading,
    isValidating,
    mutate,
  }
}
