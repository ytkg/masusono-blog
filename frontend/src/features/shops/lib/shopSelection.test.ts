import { attachStableShopIds, createShopBaseId, resolveSelectedShopId } from "@/features/shops/lib/shopSelection"
import type { Shop } from "@/features/shops/model/shop"

describe("shopSelection", () => {
  it("同一ベースIDの店舗でも連番付きIDで重複しない", () => {
    const duplicatedShops: Shop[] = [
      { name: "同名店", category: "カフェ", lat: 35.681236, lng: 139.767125 },
      { name: "同名店", category: "カフェ", lat: 35.681236, lng: 139.767125 },
    ]

    const withIds = attachStableShopIds(duplicatedShops)

    expect(withIds[0].id).toBe(`${createShopBaseId(duplicatedShops[0])}#1`)
    expect(withIds[1].id).toBe(`${createShopBaseId(duplicatedShops[1])}#2`)
  })

  it("選択中IDが表示対象に含まれない場合は先頭IDへ補正する", () => {
    const nextSelected = resolveSelectedShopId("shop-c", ["shop-a", "shop-b"])

    expect(nextSelected).toBe("shop-a")
  })

  it("表示対象が0件の場合は選択をnullにする", () => {
    const nextSelected = resolveSelectedShopId("shop-a", [])

    expect(nextSelected).toBeNull()
  })
})
