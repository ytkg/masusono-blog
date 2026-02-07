import useSWR from "swr"
import type { MetricsResponse } from "../types/metrics"
import { API_BASE } from "../constants"

const fetcher = async (url: string): Promise<MetricsResponse> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`APIリクエスト失敗: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as MetricsResponse
}

export function useMetrics() {
  return useSWR<MetricsResponse>(`${API_BASE}/metrics.json`, fetcher, {
    revalidateOnFocus: false,
  })
}
