import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
// import LocationOnIcon from '@mui/icons-material/LocationOn'
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"
import PageContainer from "../components/PageContainer"
import { usePageMeta } from "../hooks/usePageMeta"
import { useShops } from "../hooks/useShops"
import type { Shop } from "../types/shop"

const DEFAULT_CATEGORY = "ALL" as const
const createShopKey = (shop: Shop) => `${shop.name}-${shop.lat.toFixed(5)}-${shop.lng.toFixed(5)}`
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

function usePreventBodyScroll() {
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyOverflow = document.body.style.overflow

    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalBodyOverflow
    }
  }, [])
}

function useShopFilter(shops: Shop[]) {
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY)

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(shops.map((s) => s.category)))
    return uniq.sort((a, b) => a.localeCompare(b, "ja"))
  }, [shops])

  const filteredShops = useMemo(
    () => (category === DEFAULT_CATEGORY ? shops : shops.filter((s) => s.category === category)),
    [category, shops],
  )

  return { category, setCategory, categories, filteredShops }
}

function useLeafletMap({ mapContainerRef, shops, visibleShops, selectedKey, onSelect, getKey }: UseLeafletMapOptions) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const el = mapContainerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    const resizeObserver = new ResizeObserver(() => map.invalidateSize())
    resizeObserver.observe(el)
    setMapReady(true)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [mapContainerRef])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || shops.length === 0) return

    const bounds = L.latLngBounds(shops.map((s) => [s.lat, s.lng]))
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2))
  }, [mapReady, shops])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((marker) => {
      marker.remove()
    })
    markersRef.current = {}

    visibleShops.forEach((shop) => {
      const key = getKey(shop)
      const marker = L.marker([shop.lat, shop.lng], { icon: DEFAULT_MARKER_ICON }).addTo(map)
      marker.on("click", () => onSelect(key))
      marker.bindTooltip(shop.name)
      markersRef.current[key] = marker
    })
  }, [visibleShops, onSelect, getKey])

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([key, marker]) => {
      if (selectedKey && key === selectedKey) marker.openTooltip()
      else marker.closeTooltip()
    })
  }, [selectedKey])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedKey) return

    const targetShop = visibleShops.find((shop) => getKey(shop) === selectedKey)
    if (!targetShop) return

    map.setView([targetShop.lat, targetShop.lng], Math.max(14, map.getZoom()), { animate: true })
  }, [selectedKey, visibleShops, getKey])
}

// Leaflet を使った実マップ表示

export default function Shops() {
  const { data, error, isLoading } = useShops()
  const shops = useMemo(() => data ?? [], [data])
  const getKey = useCallback(createShopKey, [])
  const { category, setCategory, categories, filteredShops } = useShopFilter(shops)
  const [selected, setSelected] = useState<string | null>(null)
  const mapElRef = useRef<HTMLDivElement | null>(null)
  usePageMeta({
    title: "推し店",
    description: "増田とその他！おすすめのスポットをマップ付きで紹介。カテゴリー別に推し店を探せます。",
    canonicalPath: "/shops",
  })

  usePreventBodyScroll()
  useLeafletMap({
    mapContainerRef: mapElRef,
    shops,
    visibleShops: filteredShops,
    selectedKey: selected,
    onSelect: setSelected,
    getKey,
  })

  // 絞り込み変化時に初期選択を調整
  useEffect(() => {
    if (filteredShops.length === 0) {
      if (selected !== null) setSelected(null)
      return
    }
    const exists = filteredShops.some((s) => getKey(s) === selected)
    if (!exists) setSelected(getKey(filteredShops[0]))
  }, [filteredShops, selected, getKey])

  return (
    <PageContainer
      sx={{
        height: "calc(100dvh - 112px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
        推し店
      </Typography>

      {/* 実マップ（Leaflet） */}
      <Box
        ref={mapElRef}
        sx={{ height: { xs: 186, sm: 240 }, border: "1px solid", borderColor: "divider", borderRadius: 1, mb: 1 }}
      />

      {/* カテゴリー絞り込み */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1, mb: 1 }}>
        <Chip
          label="すべて"
          variant={category === DEFAULT_CATEGORY ? "filled" : "outlined"}
          color={category === DEFAULT_CATEGORY ? "primary" : "default"}
          onClick={() => setCategory(DEFAULT_CATEGORY)}
        />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            variant={category === cat ? "filled" : "outlined"}
            color={category === cat ? "primary" : "default"}
            onClick={() => setCategory(cat)}
          />
        ))}
      </Box>

      {/* List: 独立スクロール領域（地図は固定） */}
      <Box sx={{ overflow: "auto", pr: 1, flex: 1, minHeight: 0, pb: 4 }}>
        {isLoading && (
          <Typography variant="body2" color="text.secondary">
            読み込み中...
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="text.secondary">
            データの取得に失敗しました。
          </Typography>
        )}
        {!isLoading && !error && filteredShops.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            表示する推し店がありません。
          </Typography>
        )}
        {!isLoading && !error && filteredShops.length > 0 && (
          <Grid container spacing={2}>
            {filteredShops.map((s) => {
              const key = getKey(s)
              return (
                <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{ borderColor: "divider", cursor: "pointer" }}
                    onClick={() => setSelected(key)}
                  >
                    <CardContent sx={{ px: 1.25, py: 1, "&:last-child": { pb: 1.5 } }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {s.name}
                        </Typography>
                        {s.url && (
                          <IconButton
                            component="a"
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            size="small"
                            aria-label="open"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                        <Chip size="small" label={s.category} />
                      </Box>
                      {s.desc && (
                        <Typography variant="body2" color="text.secondary">
                          {s.desc}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
    </PageContainer>
  )
}
