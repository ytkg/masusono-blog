import { useMemo, useState } from "react"
import type { Shop } from "@/features/shops/model/shop"

export const DEFAULT_CATEGORY = "ALL" as const

export function useShopFilter(shops: Shop[]) {
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY)

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(shops.map((shop) => shop.category)))
    return uniq.sort((a, b) => a.localeCompare(b, "ja"))
  }, [shops])

  const filteredShops = useMemo(
    () => (category === DEFAULT_CATEGORY ? shops : shops.filter((shop) => shop.category === category)),
    [category, shops],
  )

  return { category, setCategory, categories, filteredShops }
}
