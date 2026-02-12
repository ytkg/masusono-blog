import useSWR from "swr"
import { fetchJson } from "../../../../shared/lib/fetchJson"

const RANKINGS_ENDPOINT = "/api/app/masuda_run/rankings.json"

export default function useRankings(enabled) {
  const { data, error, isLoading, mutate } = useSWR(enabled ? RANKINGS_ENDPOINT : null, fetchJson)

  return {
    rankings: Array.isArray(data) ? data : null,
    rankingsLoading: isLoading,
    rankingsError: Boolean(error),
    refreshRankings: mutate,
  }
}
