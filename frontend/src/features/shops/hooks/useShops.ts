import useSWR from "swr"
import type { Shop } from "@/features/shops/model/shop"
import { API_BASE } from "@/constants"
import { fetchJson } from "@/shared/api/fetchJson"

export function useShops() {
  return useSWR<Shop[]>(`${API_BASE}/shops.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
