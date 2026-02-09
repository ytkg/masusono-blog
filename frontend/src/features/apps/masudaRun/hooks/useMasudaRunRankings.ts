import useSWR from "swr"
import { API_BASE } from "@/constants"
import { fetchJson } from "@/shared/api/fetchJson"
import type { MasudaRunRanking } from "@/features/apps/masudaRun/model/ranking"

export function useMasudaRunRankings() {
  return useSWR<MasudaRunRanking[]>(`${API_BASE}/masuda_run/rankings.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
