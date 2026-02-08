import useSWR from "swr"
import type { MetricsResponse } from "@/features/apps/numbers/model/metrics"
import { API_BASE } from "@/constants"
import { fetchJson } from "@/shared/api/fetchJson"

export function useMetrics() {
  return useSWR<MetricsResponse>(`${API_BASE}/metrics.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
