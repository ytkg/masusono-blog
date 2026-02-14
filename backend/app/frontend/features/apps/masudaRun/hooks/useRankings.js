import useSWR from "swr"
import { fetchJson } from "../../../../shared/lib/fetchJson"

const RANKINGS_ENDPOINT = "/api/app/masuda_run/rankings.json"

async function postRanking(score, userId) {
  const response = await fetch(RANKINGS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ score, userId }),
  })

  if (!response.ok) {
    throw new Error(`Ranking submit failed with ${response.status}`)
  }

  return response.json()
}

export default function useRankings(enabled) {
  const { data, error, isLoading, mutate } = useSWR(enabled ? RANKINGS_ENDPOINT : null, fetchJson)

  const submitRanking = async (score, userId) => {
    await postRanking(score, userId)
    await mutate()
  }

  return {
    rankings: Array.isArray(data) ? data : null,
    rankingsLoading: isLoading,
    rankingsError: Boolean(error),
    refreshRankings: mutate,
    submitRanking,
  }
}
