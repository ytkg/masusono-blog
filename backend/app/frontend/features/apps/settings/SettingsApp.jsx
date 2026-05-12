import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useCallback, useEffect, useState } from "react"

const DEFAULT_NAME = "NO NAME"
const labelTextSx = { fontSize: "14px" }
const valueSx = { fontWeight: 700, fontSize: "22px" }
const fieldHeight = 40

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

async function fetchCurrentUser(userId) {
  const response = await fetch(`/api/app/users/${encodeURIComponent(userId)}.json`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Load failed with ${response.status}`)
  }

  return response.json()
}

async function createUser(name, userId) {
  const response = await fetch("/api/app/users.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, userId }),
  })

  if (!response.ok) {
    throw new Error(`Save failed with ${response.status}`)
  }

  return response.json()
}

function NameSection({ name, draftName, isEditing, isSaving, onStartEditing, onSave, onDraftChange }) {
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
              <Button
                variant="contained"
                size="small"
                onClick={onSave}
                disabled={isSaving}
                sx={{ height: fieldHeight }}
              >
                {isSaving ? "保存中..." : "保存"}
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

export function SettingsContent({ loadOnMount = false }) {
  const [name, setName] = useState(DEFAULT_NAME)
  const [draftName, setDraftName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const loadCurrentUser = useCallback(async () => {
    if (isEditing) return

    const userId = getCookie("user_id")
    if (!userId) return

    try {
      const current = await fetchCurrentUser(userId)
      const fetchedName = current?.name?.toString()?.trim() || DEFAULT_NAME
      setName(fetchedName)
      setDraftName(fetchedName)
      setErrorMessage("")
    } catch (_error) {
      // 取得失敗時は既存表示を維持する
    }
  }, [isEditing])

  useEffect(() => {
    if (!loadOnMount) return

    void loadCurrentUser()
  }, [loadCurrentUser, loadOnMount])

  const startEditing = () => {
    setDraftName(name)
    setErrorMessage("")
    setIsEditing(true)
  }

  const saveName = async () => {
    const trimmed = draftName.trim()
    if (trimmed.length === 0) {
      setErrorMessage("表示名を入力してください")
      return
    }

    const userId = getCookie("user_id")
    if (!userId) {
      setErrorMessage("ユーザーIDが見つかりません")
      return
    }

    setIsSaving(true)
    setErrorMessage("")

    try {
      await createUser(trimmed, userId)
      setName(trimmed)
      setIsEditing(false)
    } catch (_error) {
      setErrorMessage("表示名の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <NameSection
        name={name}
        draftName={draftName}
        isEditing={isEditing}
        isSaving={isSaving}
        onStartEditing={startEditing}
        onSave={saveName}
        onDraftChange={setDraftName}
      />
      {errorMessage ? (
        <Typography variant="body2" color="error">
          {errorMessage}
        </Typography>
      ) : null}
    </Box>
  )
}
