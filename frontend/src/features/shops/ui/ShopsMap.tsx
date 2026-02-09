import { useRef } from "react"
import Box from "@mui/material/Box"
import "leaflet/dist/leaflet.css"
import { useLeafletMap } from "@/features/shops/hooks/useLeafletMap"
import type { Shop } from "@/features/shops/model/shop"

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
      sx={{ height: { xs: 186, sm: 240 }, border: "1px solid", borderColor: "divider", borderRadius: 1, mb: 1 }}
    />
  )
}
