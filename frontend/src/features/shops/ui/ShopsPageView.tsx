import PageContainer from "@/shared/ui/PageContainer"
import type { Shop } from "@/features/shops/model/shop"
import { ShopCategoryFilter } from "@/features/shops/ui/ShopCategoryFilter"
import { ShopsList } from "@/features/shops/ui/ShopsList"
import { ShopsMap } from "@/features/shops/ui/ShopsMap"
import { SHOPS_PAGE_LAYOUT } from "@/features/shops/ui/shopsPageStyleConstants"
import SectionHeading from "@/shared/ui/SectionHeading"

type ShopsPageViewProps = {
  shops: Shop[]
  filteredShops: Shop[]
  selected: string | null
  category: string
  categories: string[]
  isLoading: boolean
  errorMessage: string | null
  getKey: (shop: Shop) => string
  onSelect: (key: string) => void
  onCategoryChange: (category: string) => void
}

export function ShopsPageView({
  shops,
  filteredShops,
  selected,
  category,
  categories,
  isLoading,
  errorMessage,
  getKey,
  onSelect,
  onCategoryChange,
}: ShopsPageViewProps) {
  return (
    <PageContainer
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
      <ShopsMap shops={shops} visibleShops={filteredShops} selectedKey={selected} onSelect={onSelect} getKey={getKey} />
      <ShopCategoryFilter category={category} categories={categories} onChange={onCategoryChange} />
      <ShopsList
        shops={filteredShops}
        selectedKey={selected}
        isLoading={isLoading}
        errorMessage={errorMessage}
        getKey={getKey}
        onSelect={onSelect}
      />
    </PageContainer>
  )
}
