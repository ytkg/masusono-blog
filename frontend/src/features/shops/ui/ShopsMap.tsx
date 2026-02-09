import { useRef } from "react"
import Box from "@mui/material/Box"
import "leaflet/dist/leaflet.css"
import { useLeafletMap } from "@/features/shops/hooks/useLeafletMap"
import type { Shop } from "@/features/shops/model/shop"
import { SHOPS_PAGE_LAYOUT } from "@/features/shops/ui/shopsPageStyleConstants"

type ShopsMapProps = {
  shops: Shop[]
  visibleShops: Shop[]
  selectedKey: string | null
  onSelect: (key: string) => void
  getKey: (shop: Shop) => string
}

export function ShopsMap({ shops, visibleShops, selectedKey, onSelect, getKey }: ShopsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useLeafletMap({
    mapContainerRef,
    shops,
    visibleShops,
    selectedKey,
    onSelect,
    getKey,
  })

  return (
    <Box
      ref={mapContainerRef}
      sx={{
        height: SHOPS_PAGE_LAYOUT.mapHeight,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: SHOPS_PAGE_LAYOUT.mapBorderRadius,
        mb: SHOPS_PAGE_LAYOUT.sectionSpacing,
      }}
    />
  )
}
