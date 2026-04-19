import useApiSWR from "@/shared/hooks/useApiSWR"

const NUMBERS_ENDPOINT = "/api/app/numbers/metrics.json"

export default function useMetrics(enabled) {
  const { data, error, isLoading, mutate } = useApiSWR(NUMBERS_ENDPOINT, enabled)

  return {
    metrics: data ?? null,
    isLoading,
    error,
    hasError: Boolean(error),
    refresh: mutate,
  }
}
