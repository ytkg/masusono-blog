import useApiSWR from "@/shared/hooks/useApiSWR"
import { postJson } from "@/shared/lib/fetchJson"

const RANKINGS_ENDPOINT = "/api/app/masuda_run/rankings.json"

export default function useRankings(enabled) {
  const { data, error, isLoading, mutate } = useApiSWR(RANKINGS_ENDPOINT, enabled)

  const submitRanking = async (score, userId) => {
    await postJson(RANKINGS_ENDPOINT, { score, userId })
    await mutate()
  }

  return {
    rankings: Array.isArray(data) ? data : null,
    rankingsLoading: isLoading,
    error,
    rankingsError: Boolean(error),
    refreshRankings: mutate,
    submitRanking,
  }
}
