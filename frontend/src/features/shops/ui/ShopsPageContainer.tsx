import { useCallback, useEffect, useMemo, useState } from "react"
import { useShops } from "@/features/shops/hooks/useShops"
import { usePreventBodyScroll } from "@/features/shops/hooks/usePreventBodyScroll"
import { useShopFilter } from "@/features/shops/hooks/useShopFilter"
import { attachStableShopIds, createShopBaseId, resolveSelectedShopId } from "@/features/shops/lib/shopSelection"
import type { Shop } from "@/features/shops/model/shop"
import { ShopsPageView } from "@/features/shops/ui/ShopsPageView"

function createShopIdResolver(shops: Shop[]) {
  const shopsWithId = attachStableShopIds(shops)
  const idByShop = new Map<Shop, string>(shopsWithId.map(({ id, shop }) => [shop, id]))

  return (shop: Shop) => idByShop.get(shop) ?? `${createShopBaseId(shop)}#1`
}

export function ShopsPageContainer() {
  const { shops, rawError, isLoading, errorMessage } = useShops()
  const { category, setCategory, categories, filteredShops } = useShopFilter(shops)
  const [selected, setSelected] = useState<string | null>(null)
  const getKey = useMemo(() => createShopIdResolver(shops), [shops])

  usePreventBodyScroll()

  const filteredShopIds = useMemo(() => filteredShops.map(getKey), [filteredShops, getKey])

  useEffect(() => {
    setSelected((currentSelected) => resolveSelectedShopId(currentSelected, filteredShopIds))
  }, [filteredShopIds])

  const handleSelect = useCallback((shopId: string) => {
    setSelected(shopId)
  }, [])

  return (
    <ShopsPageView
      shops={shops}
      filteredShops={filteredShops}
      selected={selected}
      category={category}
      categories={categories}
      isLoading={isLoading}
      errorMessage={rawError ? errorMessage : null}
      getKey={getKey}
      onSelect={handleSelect}
      onCategoryChange={setCategory}
    />
  )
}
