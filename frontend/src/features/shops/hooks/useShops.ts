import { useMemo } from "react"
import useSWR from "swr"
import type { Shop } from "@/features/shops/model/shop"
import { API_BASE } from "@/constants"
import { fetchJson } from "@/shared/api/fetchJson"

export type UseShopsResult = {
  shops: Shop[]
  isLoading: boolean
  errorMessage: string | null
  rawError: unknown
}

export function useShops(): UseShopsResult {
  const { data, error, isLoading } = useSWR<Shop[]>(`${API_BASE}/shops.json`, fetchJson, {
    revalidateOnFocus: false,
  })

  return useMemo(
    () => ({
      shops: data ?? [],
      isLoading,
      errorMessage: error ? "データの取得に失敗しました。" : null,
      rawError: error,
    }),
    [data, error, isLoading],
  )
}
