import useSWR from "swr"
import type { Shop } from "../types/shop"
import { API_BASE } from "../constants"
import { fetchJson } from "../utils/fetchJson"

export function useShops() {
  return useSWR<Shop[]>(`${API_BASE}/shops.json`, fetchJson, {
    revalidateOnFocus: false,
  })
}
