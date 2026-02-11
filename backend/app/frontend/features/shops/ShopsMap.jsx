import { useRef } from "react"
import Box from "@mui/material/Box"
import "leaflet/dist/leaflet.css"
import { useLeafletMap } from "./useLeafletMap"
import { SHOPS_PAGE_LAYOUT } from "./shopsPageStyleConstants"

export default function ShopsMap({ shops, visibleShops, selectedKey, onSelect, getKey }) {
  const mapContainerRef = useRef(null)

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
