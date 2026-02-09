import type { Shop } from "@/features/shops/model/shop"

export type ShopWithId = {
  id: string
  shop: Shop
}

function formatCoordinate(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : "invalid"
}

export function createShopBaseId(shop: Shop) {
  return `${shop.name}-${shop.category}-${formatCoordinate(shop.lat)}-${formatCoordinate(shop.lng)}`
}

export function attachStableShopIds(shops: Shop[]): ShopWithId[] {
  const occurrences = new Map<string, number>()

  return shops.map((shop) => {
    const baseId = createShopBaseId(shop)
    const count = (occurrences.get(baseId) ?? 0) + 1
    occurrences.set(baseId, count)

    return {
      id: `${baseId}#${count}`,
      shop,
    }
  })
}

export function resolveSelectedShopId(selectedId: string | null, visibleShopIds: string[]) {
  if (visibleShopIds.length === 0) return null
  if (selectedId && visibleShopIds.includes(selectedId)) return selectedId
  return visibleShopIds[0]
}
