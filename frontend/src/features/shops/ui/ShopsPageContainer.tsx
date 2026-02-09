import { useCallback, useEffect, useMemo, useState } from "react"
import { useShops } from "@/features/shops/hooks/useShops"
import { usePreventBodyScroll } from "@/features/shops/hooks/usePreventBodyScroll"
import { useShopFilter } from "@/features/shops/hooks/useShopFilter"
import type { Shop } from "@/features/shops/model/shop"
import { ShopsPageView } from "@/features/shops/ui/ShopsPageView"

const createShopKey = (shop: Shop) => `${shop.name}-${shop.lat.toFixed(5)}-${shop.lng.toFixed(5)}`

export function ShopsPageContainer() {
  const { data, error, isLoading } = useShops()
  const shops = useMemo(() => data ?? [], [data])
  const { category, setCategory, categories, filteredShops } = useShopFilter(shops)
  const [selected, setSelected] = useState<string | null>(null)
  const getKey = useCallback(createShopKey, [])

  usePreventBodyScroll()

  useEffect(() => {
    if (filteredShops.length === 0) {
      if (selected !== null) setSelected(null)
      return
    }

    const exists = filteredShops.some((shop) => getKey(shop) === selected)
    if (!exists) setSelected(getKey(filteredShops[0]))
  }, [filteredShops, selected, getKey])

  return (
    <ShopsPageView
      shops={shops}
      filteredShops={filteredShops}
      selected={selected}
      category={category}
      categories={categories}
      isLoading={isLoading}
      hasError={Boolean(error)}
      getKey={getKey}
      onSelect={setSelected}
      onCategoryChange={setCategory}
    />
  )
}
