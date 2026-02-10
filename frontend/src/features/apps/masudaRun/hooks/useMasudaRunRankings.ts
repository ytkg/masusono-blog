import useSWR from "swr"
import { API_BASE } from "@/constants"
import { fetchJson } from "@/shared/api/fetchJson"
import type { MasudaRunRanking } from "@/features/apps/masudaRun/model/ranking"

const RANKINGS_URL = `${API_BASE}/masuda_run/rankings.json`

export function useMasudaRunRankings() {
  return useSWR<MasudaRunRanking[]>(RANKINGS_URL, fetchJson, {
    revalidateOnFocus: false,
  })
}
