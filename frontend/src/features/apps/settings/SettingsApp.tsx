import SettingsIcon from "@mui/icons-material/Settings"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useState } from "react"
import AppsDrawerLauncher from "@/features/apps/ui/AppsDrawerLauncher"

const DEFAULT_NAME = "NO NAME"
const labelTextSx = { fontSize: "14px" }
const valueSx = { fontWeight: 700, fontSize: "22px" }
const fieldHeight = 40

type NameSectionProps = {
  name: string
  draftName: string
  isEditing: boolean
  onStartEditing: () => void
  onSave: () => void
  onDraftChange: (value: string) => void
}

function NameSection({ name, draftName, isEditing, onStartEditing, onSave, onDraftChange }: NameSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 1.5 }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
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
                onChange={(event) => onDraftChange(event.target.value)}
                inputProps={{ sx: valueSx }}
                fullWidth
                sx={{ "& .MuiInputBase-root": { height: fieldHeight } }}
              />
            ) : (
              <Box sx={{ height: fieldHeight, display: "flex", alignItems: "center" }}>
                <Typography variant="h4" sx={valueSx}>
                  {name}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            {isEditing ? (
              <Button variant="contained" size="small" onClick={onSave} sx={{ height: fieldHeight }}>
                保存
              </Button>
            ) : (
              <Button variant="outlined" size="small" onClick={onStartEditing} sx={{ height: fieldHeight }}>
                変更
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

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
        <NameSection
          name={name}
          draftName={draftName}
          isEditing={isEditing}
          onStartEditing={startEditing}
          onSave={saveName}
          onDraftChange={setDraftName}
        />
      </Box>
    </AppsDrawerLauncher>
  )
}
