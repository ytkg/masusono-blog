import { describe, expect, it } from "vitest"
import { attachStableShopIds, createShopBaseId, resolveSelectedShopId } from "./shopSelection"

describe("createShopBaseId", () => {
  it("座標を固定小数点付きで含むベースIDを返す", () => {
    expect(
      createShopBaseId({
        name: "喫茶ますだ",
        category: "cafe",
        lat: 35.1234567,
        lng: 139.9876543,
      }),
    ).toBe("喫茶ますだ-cafe-35.123457-139.987654")
  })
})

describe("attachStableShopIds", () => {
  it("重複する店舗にも安定した連番IDを付与する", () => {
    expect(
      attachStableShopIds([
        { name: "喫茶ますだ", category: "cafe", lat: 35.1, lng: 139.1 },
        { name: "喫茶ますだ", category: "cafe", lat: 35.1, lng: 139.1 },
      ]),
    ).toEqual([
      {
        id: "喫茶ますだ-cafe-35.100000-139.100000#1",
        shop: { name: "喫茶ますだ", category: "cafe", lat: 35.1, lng: 139.1 },
      },
      {
        id: "喫茶ますだ-cafe-35.100000-139.100000#2",
        shop: { name: "喫茶ますだ", category: "cafe", lat: 35.1, lng: 139.1 },
      },
    ])
  })
})

describe("resolveSelectedShopId", () => {
  it("選択中IDが見えていれば維持し、なければ先頭へフォールバックする", () => {
    expect(resolveSelectedShopId("shop-2", ["shop-1", "shop-2"])).toBe("shop-2")
    expect(resolveSelectedShopId("missing", ["shop-1", "shop-2"])).toBe("shop-1")
    expect(resolveSelectedShopId("missing", [])).toBeNull()
  })
})
