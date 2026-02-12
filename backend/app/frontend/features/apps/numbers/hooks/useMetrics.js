import useSWR from "swr"
import { fetchJson } from "../../../../shared/lib/fetchJson"

const NUMBERS_ENDPOINT = "/api/app/numbers/metrics.json"

export default function useMetrics(enabled) {
  const { data, error, isLoading, mutate } = useSWR(enabled ? NUMBERS_ENDPOINT : null, fetchJson)

  return {
    metrics: data ?? null,
    isLoading,
    hasError: Boolean(error),
    refresh: mutate,
  }
}
