import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
// import LocationOnIcon from '@mui/icons-material/LocationOn'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import data from '../assets/shops.json'

type Shop = {
  name: string
  lat: number
  lng: number
  category: string
  url?: string
  desc?: string
}

// Leaflet を使った実マップ表示

export default function Shops() {
  const shops = (data as unknown as Shop[])
  // name + lat + lng で安定キーを生成（小数は丸め）
  const getKey = (s: Shop) => `${s.name}-${s.lat.toFixed(5)}-${s.lng.toFixed(5)}`
  const [selected, setSelected] = useState<string | null>(shops[0] ? getKey(shops[0]) : null)
  const mapElRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})

  // ページ全体のスクロールを抑制（一覧のみスクロール可能にする）
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyOverflow = document.body.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.overflow = originalBodyOverflow
    }
  }, [])

  // 地図初期化
  useEffect(() => {
    const el = mapElRef.current
    if (!el || mapRef.current) return
    const map = L.map(el)
    mapRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const bounds = L.latLngBounds(shops.map(s => [s.lat, s.lng]))
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2))

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => { ro.disconnect(); map.remove(); mapRef.current = null }
  }, [shops])

  // マーカー更新（ピン：Leaflet デフォルトアイコン）
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}
    const defaultIcon = L.icon({
      iconUrl: markerIconUrl,
      iconRetinaUrl: markerIcon2xUrl,
      shadowUrl: markerShadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
      tooltipAnchor: [16, -28],
    })
    shops.forEach(s => {
      const key = getKey(s)
      const marker = L.marker([s.lat, s.lng], { icon: defaultIcon }).addTo(map)
      marker.on('click', () => setSelected(key))
      marker.bindTooltip(s.name)
      markersRef.current[key] = marker
    })
  }, [shops, selected])

  // 選択時に中心へ
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected) return
    const s = shops.find(v => getKey(v) === selected)
    if (s) map.setView([s.lat, s.lng], Math.max(14, map.getZoom()), { animate: true })
  }, [selected, shops])

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        height: 'calc(100dvh - 112px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Typography variant="h5" sx={{ mb: 1 }}>推し店</Typography>

      {/* 実マップ（Leaflet） */}
      <Box
        ref={mapElRef}
        sx={{ height: { xs: 280, sm: 360 }, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
      />

      {/* List: 独立スクロール領域（地図は固定） */}
      <Box sx={{ overflow: 'auto', pr: 1, flex: 1, minHeight: 0, pb: 8 }}>
        <Grid container spacing={2}>
          {shops.map((s) => {
            const key = getKey(s)
            return (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                variant={selected === key ? 'elevation' : 'outlined'}
                sx={{ borderColor: selected === key ? 'primary.main' : 'divider', cursor: 'pointer' }}
                onClick={() => {
                  setSelected(key)
                  const map = mapRef.current
                  if (map) {
                    map.setView([s.lat, s.lng], Math.max(14, map.getZoom()), { animate: true })
                  }
                  const mk = markersRef.current[key]
                  if (mk) mk.openTooltip()
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                    {s.url && (
                      <IconButton component="a" href={s.url} target="_blank" rel="noreferrer" size="small" aria-label="open">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip size="small" label={s.category} />
                  </Box>
                  {s.desc && (
                    <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )})}
        </Grid>
      </Box>
    </Box>
  )
}
