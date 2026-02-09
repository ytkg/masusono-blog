import MyLocationIcon from "@mui/icons-material/MyLocation"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useState } from "react"
import AppsDrawerLauncher from "@/features/apps/ui/AppsDrawerLauncher"

type GeoState =
  | { status: "idle"; latitude: null; longitude: null; message: string | null }
  | { status: "loading"; latitude: null; longitude: null; message: string | null }
  | { status: "success"; latitude: number; longitude: number; message: string | null }
  | { status: "error"; latitude: null; longitude: null; message: string }

const initialState: GeoState = {
  status: "idle",
  latitude: null,
  longitude: null,
  message: null,
}

export default function LocationApp() {
  const [state, setState] = useState<GeoState>(initialState)

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", latitude: null, longitude: null, message: "位置情報に対応していません。" })
      return
    }
    setState({ status: "loading", latitude: null, longitude: null, message: null })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          message: null,
        })
      },
      (error) => {
        setState({
          status: "error",
          latitude: null,
          longitude: null,
          message: error.message || "位置情報の取得に失敗しました。",
        })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <AppsDrawerLauncher title="位置情報" buttonAriaLabel="位置情報を開く" buttonIcon={<MyLocationIcon />}>
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          端末の位置情報を取得して緯度・経度を表示します。
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button variant="contained" size="small" onClick={requestLocation} disabled={state.status === "loading"}>
            {state.status === "loading" ? "取得中..." : "位置情報を取得"}
          </Button>
        </Box>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              緯度
            </Typography>
            <Typography variant="body1">
              {state.latitude !== null ? state.latitude.toFixed(6) : "--"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              経度
            </Typography>
            <Typography variant="body1">
              {state.longitude !== null ? state.longitude.toFixed(6) : "--"}
            </Typography>
          </Box>
          {state.message ? (
            <Typography variant="body2" color="error">
              {state.message}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </AppsDrawerLauncher>
  )
}
