import { useEffect, useMemo, useState } from "react"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import ShopsList from "../../features/shops/ShopsList"
import ShopCategoryFilter, { DEFAULT_CATEGORY } from "../../features/shops/ShopCategoryFilter"
import ShopsMap from "../../features/shops/ShopsMap"
import { SHOPS_PAGE_LAYOUT } from "../../features/shops/shopsPageStyleConstants"
import { attachStableShopIds, createShopBaseId, resolveSelectedShopId } from "../../features/shops/shopSelection"
import { usePreventBodyScroll } from "../../features/shops/usePreventBodyScroll"
import SeoHead from "../../shared/SeoHead"

function createShopIdResolver(shops) {
  const shopsWithId = attachStableShopIds(shops)
  const idByShop = new Map(shopsWithId.map(({ id, shop }) => [shop, id]))

  return (shop) => idByShop.get(shop) ?? `${createShopBaseId(shop)}#1`
}

export default function Shops({ shops }) {
  const normalizedShops = shops ?? []
  const [category, setCategory] = useState(DEFAULT_CATEGORY)
  const [selected, setSelected] = useState(null)
  const getKey = useMemo(() => createShopIdResolver(normalizedShops), [normalizedShops])

  usePreventBodyScroll()

  const categories = useMemo(
    () =>
      Array.from(
        new Set(normalizedShops.map((shop) => shop.category).filter((v) => typeof v === "string" && v.length > 0)),
      ),
    [normalizedShops],
  )

  const filteredShops = useMemo(() => {
    if (category === DEFAULT_CATEGORY) return normalizedShops
    return normalizedShops.filter((shop) => shop.category === category)
  }, [normalizedShops, category])

  const filteredShopIds = useMemo(() => filteredShops.map(getKey), [filteredShops, getKey])

  useEffect(() => {
    setSelected((currentSelected) => resolveSelectedShopId(currentSelected, filteredShopIds))
  }, [filteredShopIds])

  return (
    <>
      <SeoHead
        title="推し店"
        description="増田とその他！おすすめのスポットを紹介。カテゴリー別に推し店を探せます。"
        canonicalPath="/shop"
      />

      <PageContainer
        id="shops"
        sx={{
          height: `calc(100dvh - ${SHOPS_PAGE_LAYOUT.viewportHeightOffset}px)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <SectionHeading component="h1" sx={{ mb: SHOPS_PAGE_LAYOUT.sectionSpacing }}>
          推し店
        </SectionHeading>
        <ShopsMap
          shops={normalizedShops}
          visibleShops={filteredShops}
          selectedKey={selected}
          onSelect={setSelected}
          getKey={getKey}
        />
        <ShopCategoryFilter category={category} categories={categories} onChange={setCategory} />
        <ShopsList shops={filteredShops} selectedKey={selected} onSelect={setSelected} getKey={getKey} />
      </PageContainer>
    </>
  )
}
