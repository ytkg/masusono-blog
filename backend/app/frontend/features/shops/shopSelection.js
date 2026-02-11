function formatCoordinate(value) {
  return Number.isFinite(value) ? value.toFixed(6) : String(value)
}

export function createShopBaseId(shop) {
  return `${shop.name}-${shop.category}-${formatCoordinate(shop.lat)}-${formatCoordinate(shop.lng)}`
}

export function attachStableShopIds(shops) {
  const counter = new Map()

  return shops.map((shop) => {
    const baseId = createShopBaseId(shop)
    const next = (counter.get(baseId) ?? 0) + 1
    counter.set(baseId, next)

    return { id: `${baseId}#${next}`, shop }
  })
}

export function resolveSelectedShopId(selectedId, visibleShopIds) {
  if (visibleShopIds.length === 0) return null
  if (selectedId && visibleShopIds.includes(selectedId)) return selectedId
  return visibleShopIds[0]
}
