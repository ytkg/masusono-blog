import useSWR from "swr"
import type { Shop } from "../types/shop"
import { API_BASE } from "../constants"

const fetcher = async (url: string): Promise<Shop[]> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`APIリクエスト失敗: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as Shop[]
}

export function useShops() {
  return useSWR<Shop[]>(`${API_BASE}/shops.json`, fetcher, {
    revalidateOnFocus: false,
  })
}
