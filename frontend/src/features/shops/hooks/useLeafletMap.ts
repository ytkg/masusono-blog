import { useEffect, useRef, useState, type MutableRefObject } from "react"
import L from "leaflet"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import type { Shop } from "@/features/shops/model/shop"

const DEFAULT_MARKER_ICON = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  tooltipAnchor: [16, -28],
})

type UseLeafletMapOptions = {
  mapContainerRef: MutableRefObject<HTMLDivElement | null>
  shops: Shop[]
  visibleShops: Shop[]
  selectedKey: string | null
  onSelect: (key: string) => void
  getKey: (shop: Shop) => string
}

function isValidLatLng(shop: Shop) {
  return (
    Number.isFinite(shop.lat) &&
    Number.isFinite(shop.lng) &&
    shop.lat >= -90 &&
    shop.lat <= 90 &&
    shop.lng >= -180 &&
    shop.lng <= 180
  )
}

function toValidShops(shops: Shop[]) {
  return shops.filter(isValidLatLng)
}

function clearMarkers(markersRef: MutableRefObject<Record<string, L.Marker>>) {
  Object.values(markersRef.current).forEach((marker) => {
    marker.off()
    marker.remove()
  })
  markersRef.current = {}
}

function syncSelectedTooltip(markersRef: MutableRefObject<Record<string, L.Marker>>, selectedKey: string | null) {
  Object.entries(markersRef.current).forEach(([key, marker]) => {
    if (selectedKey && key === selectedKey) marker.openTooltip()
    else marker.closeTooltip()
  })
}

function rebuildMarkers({
  map,
  markersRef,
  shops,
  onSelect,
  getKey,
}: {
  map: L.Map
  markersRef: MutableRefObject<Record<string, L.Marker>>
  shops: Shop[]
  onSelect: (key: string) => void
  getKey: (shop: Shop) => string
}) {
  clearMarkers(markersRef)

  toValidShops(shops).forEach((shop) => {
    const key = getKey(shop)
    const marker = L.marker([shop.lat, shop.lng], { icon: DEFAULT_MARKER_ICON }).addTo(map)
    marker.on("click", () => onSelect(key))
    marker.bindTooltip(shop.name)
    markersRef.current[key] = marker
  })
}

export function useLeafletMap({
  mapContainerRef,
  shops,
  visibleShops,
  selectedKey,
  onSelect,
  getKey,
}: UseLeafletMapOptions) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const element = mapContainerRef.current
    if (!element || mapRef.current) return

    const map = L.map(element)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    const resizeObserver = new ResizeObserver(() => map.invalidateSize())
    resizeObserver.observe(element)
    setMapReady(true)

    return () => {
      resizeObserver.disconnect()
      clearMarkers(markersRef)
      map.remove()
      mapRef.current = null
    }
  }, [mapContainerRef])

  useEffect(() => {
    const map = mapRef.current
    const validShops = toValidShops(shops)
    if (!mapReady || !map || validShops.length === 0) return

    const bounds = L.latLngBounds(validShops.map((shop) => [shop.lat, shop.lng]))
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2))
  }, [mapReady, shops])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    rebuildMarkers({
      map,
      markersRef,
      shops: visibleShops,
      onSelect,
      getKey,
    })
  }, [visibleShops, onSelect, getKey])

  useEffect(() => {
    syncSelectedTooltip(markersRef, selectedKey)
  }, [selectedKey])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedKey) return

    const targetShop = visibleShops.find((shop) => getKey(shop) === selectedKey)
    if (!targetShop || !isValidLatLng(targetShop)) return

    map.setView([targetShop.lat, targetShop.lng], Math.max(14, map.getZoom()), { animate: true })
  }, [selectedKey, visibleShops, getKey])
}
