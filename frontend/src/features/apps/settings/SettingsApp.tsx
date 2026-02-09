import SettingsIcon from "@mui/icons-material/Settings"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useEffect, useState } from "react"
import AppsDrawerLauncher from "@/features/apps/ui/AppsDrawerLauncher"

const DEFAULT_NAME = "NO NAME"
type LocationPermissionState = "unknown" | "prompt" | "granted" | "denied"

export default function SettingsApp() {
  const [name, setName] = useState(DEFAULT_NAME)
  const [draftName, setDraftName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)
  const [locationPermission, setLocationPermission] = useState<LocationPermissionState>("unknown")
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)

  const startEditing = () => {
    setDraftName(name)
    setIsEditing(true)
  }

  const saveName = () => {
    const trimmed = draftName.trim()
    setName(trimmed.length > 0 ? trimmed : DEFAULT_NAME)
    setIsEditing(false)
  }

  useEffect(() => {
    if (!("permissions" in navigator)) return
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        setLocationPermission(status.state)
        status.onchange = () => setLocationPermission(status.state)
      })
      .catch(() => {
        setLocationPermission("unknown")
      })
  }, [])

  const requestLocationPermission = () => {
    if (!("geolocation" in navigator)) {
      setLocationPermission("denied")
      return
    }
    setIsRequestingLocation(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationPermission("granted")
        setIsRequestingLocation(false)
      },
      () => {
        setLocationPermission("denied")
        setIsRequestingLocation(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    )
  }

  const isLocationGranted = locationPermission === "granted"
  const isLocationToggleOn = isLocationGranted

  return (
    <AppsDrawerLauncher title="設定" buttonAriaLabel="設定を開く" buttonIcon={<SettingsIcon />}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            表示名
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              {isEditing ? (
                <TextField
                  label=""
                  placeholder="表示名"
                  value={draftName}
                  size="small"
                  onChange={(event) => setDraftName(event.target.value)}
                  fullWidth
                />
              ) : (
                <Box sx={{ minHeight: 40, display: "flex", alignItems: "center" }}>
                  <Typography variant="h6">{name}</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              {isEditing ? (
                <Button variant="contained" size="small" onClick={saveName} sx={{ height: 40 }}>
                  保存
                </Button>
              ) : (
                <Button variant="outlined" size="small" onClick={startEditing} sx={{ height: 40 }}>
                  変更
                </Button>
              )}
            </Box>
          </Box>
        </Stack>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            位置情報
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                位置情報の許可
              </Typography>
              <Typography variant="body1">
                {isLocationGranted ? "許可中" : locationPermission === "denied" ? "拒否" : "未確認"}
              </Typography>
            </Box>
            <Switch
              checked={isLocationToggleOn}
              disabled={isLocationGranted || isRequestingLocation}
              onChange={(event) => {
                if (event.target.checked) requestLocationPermission()
              }}
              inputProps={{ "aria-label": "位置情報の許可" }}
            />
          </Box>
          {locationPermission === "denied" ? (
            <Typography variant="body2" color="text.secondary">
              拒否後に許可するには端末の設定で位置情報を有効にしてください。
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              オフにする場合は端末の設定で変更してください。
            </Typography>
          )}
        </Stack>
      </Box>
    </AppsDrawerLauncher>
  )
}
