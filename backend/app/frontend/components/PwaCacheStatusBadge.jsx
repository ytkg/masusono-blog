import { useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const MESSAGE_TYPE = "SW_NAVIGATION_DIAGNOSTIC"

function isEnabled() {
  const params = new URLSearchParams(window.location.search)
  return params.get("pwa_debug") === "1"
}

function buildLabel(status) {
  switch (status) {
    case "cache":
      return "キャッシュ"
    case "cache-fallback":
      return "キャッシュ(フォールバック)"
    case "network":
      return "ネットワーク"
    case "offline-fallback":
      return "オフライン代替"
    case "uncontrolled":
      return "SW未制御"
    case "unsupported":
      return "SW未対応"
    default:
      return "判定待ち"
  }
}

function buildColor(status) {
  switch (status) {
    case "cache":
      return "#1b5e20"
    case "cache-fallback":
      return "#2e7d32"
    case "network":
      return "#37474f"
    case "offline-fallback":
      return "#b71c1c"
    case "uncontrolled":
    case "unsupported":
      return "#6d4c41"
    default:
      return "#455a64"
  }
}

function formatCachedAge(cachedAt) {
  if (!cachedAt) return null
  const ageSec = Math.max(0, Math.floor((Date.now() - cachedAt) / 1000))
  return `${ageSec}s前`
}

export default function PwaCacheStatusBadge() {
  const enabled = useMemo(() => {
    if (typeof window === "undefined") return false
    return isEnabled()
  }, [])
  const [state, setState] = useState({ status: "pending", path: "", latencyMs: null, cachedAt: null })

  useEffect(() => {
    if (!enabled) return undefined

    if (!("serviceWorker" in navigator)) {
      setState({ status: "unsupported", path: "", latencyMs: null, cachedAt: null })
      return undefined
    }

    if (!navigator.serviceWorker.controller) {
      setState({ status: "uncontrolled", path: "", latencyMs: null, cachedAt: null })
    }

    const onMessage = (event) => {
      const data = event.data
      if (!data || data.type !== MESSAGE_TYPE || !data.payload) return

      setState({
        status: data.payload.source || "pending",
        path: data.payload.path || "",
        latencyMs: Number.isFinite(data.payload.latencyMs) ? data.payload.latencyMs : null,
        cachedAt: Number.isFinite(data.payload.cachedAt) ? data.payload.cachedAt : null,
      })
    }

    navigator.serviceWorker.addEventListener("message", onMessage)
    return () => navigator.serviceWorker.removeEventListener("message", onMessage)
  }, [enabled])

  if (!enabled) return null

  return (
    <Box
      sx={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: (theme) => theme.zIndex.snackbar + 1,
        borderRadius: 1,
        px: 1,
        py: 0.75,
        bgcolor: buildColor(state.status),
        color: "#fff",
        fontSize: 12,
        lineHeight: 1.3,
        boxShadow: 2,
        maxWidth: "calc(100vw - 24px)",
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
        PWA: {buildLabel(state.status)}
      </Typography>
      <Typography sx={{ fontSize: 11 }}>経路: {state.path || "-"}</Typography>
      <Typography sx={{ fontSize: 11 }}>
        応答: {state.latencyMs != null ? `${state.latencyMs}ms` : "-"} / 保存: {formatCachedAge(state.cachedAt) || "-"}
      </Typography>
    </Box>
  )
}
