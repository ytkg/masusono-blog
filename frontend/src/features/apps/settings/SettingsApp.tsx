import SettingsIcon from "@mui/icons-material/Settings"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useState } from "react"
import AppsDrawerLauncher from "@/features/apps/ui/AppsDrawerLauncher"

const DEFAULT_NAME = "NO NAME"

export default function SettingsApp() {
  const [name, setName] = useState(DEFAULT_NAME)
  const [draftName, setDraftName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)

  const startEditing = () => {
    setDraftName(name)
    setIsEditing(true)
  }

  const saveName = () => {
    const trimmed = draftName.trim()
    setName(trimmed.length > 0 ? trimmed : DEFAULT_NAME)
    setIsEditing(false)
  }

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
      </Box>
    </AppsDrawerLauncher>
  )
}
