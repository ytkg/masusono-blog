import useSWR from "swr"
import type { MetricsResponse } from "../types/metrics"
import { API_BASE } from "../constants"
import { fetchJson } from "../utils/fetchJson"

export function useMetrics() {
  return useSWR<MetricsResponse>(`${API_BASE}/metrics.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
