import { itemLabelTextSx, supportingTextSx } from "@/shared/typographyStyles"
import StatusAlert from "@/shared/components/StatusAlert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import SettingsIcon from "@mui/icons-material/Settings"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useCallback, useEffect, useState } from "react"
import { getUserIdFromCookie } from "@/shared/lib/userId"
import { fetchJson, postJson } from "@/shared/lib/fetchJson"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import { useAppLoading } from "../shared/AppsLoadingContext"
import { getWebPushState, subscribeToWebPush, unsubscribeFromWebPush } from "./webPush"

const DEFAULT_NAME = "NO NAME"
const valueSx = { fontWeight: 700, fontSize: "22px" }
const fieldHeight = 40

function SettingsError({ id, children, spacing = 1 }) {
  return (
    <StatusAlert id={id} sx={{ mt: spacing }}>
      {children}
    </StatusAlert>
  )
}

function NameSection({
  name,
  draftName,
  isEditing,
  isSaving,
  inputError,
  errorMessage,
  onStartEditing,
  onSave,
  onDraftChange,
}) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 1.5 }}>
        <Typography variant="body2" sx={itemLabelTextSx}>
          表示名
        </Typography>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <Box>
                <TextField
                  label=""
                  error={Boolean(inputError)}
                  placeholder="表示名"
                  value={draftName}
                  size="small"
                  onChange={(event) => onDraftChange(event.target.value)}
                  slotProps={{
                    htmlInput: {
                      "aria-label": "表示名",
                      sx: { ...valueSx, py: 0, height: "100%", boxSizing: "border-box" },
                      "aria-describedby": inputError ? "display-name-error" : undefined,
                    },
                  }}
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { height: fieldHeight } }}
                />
                {inputError ? <SettingsError id="display-name-error">{inputError}</SettingsError> : null}
              </Box>
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
        {errorMessage ? (
          <Box sx={{ mt: -0.25 }}>
            <SettingsError spacing={0}>{errorMessage}</SettingsError>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  )
}

function NotificationsSection({ state, isSaving, errorMessage, onSubscribe, onUnsubscribe }) {
  const denied = state.permission === "denied"
  const disabled = !state.supported || denied || isSaving
  const description = !state.supported
    ? "このブラウザは通知に対応していません。"
    : denied
      ? "ブラウザのサイト設定から通知を許可してください。"
      : state.subscribed
        ? "新しい記事が公開されたときに通知を受け取ります。"
        : "新しい記事が公開されたときに通知を受け取れます。"

  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 1.5 }}>
        <Typography variant="body2" sx={itemLabelTextSx}>
          新着記事の通知
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={supportingTextSx}>
              {description}
            </Typography>
          </Box>
          <Switch
            checked={state.subscribed}
            disabled={disabled}
            slotProps={{ input: { "aria-label": "新着記事の通知" } }}
            onChange={state.subscribed ? onUnsubscribe : onSubscribe}
          />
        </Box>
        {errorMessage ? (
          <Box sx={{ mt: -0.25 }}>
            <SettingsError spacing={0}>{errorMessage}</SettingsError>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function SettingsContent({ loadOnMount = false }) {
  const registerLoadingTask = useAppLoading()
  const [name, setName] = useState(DEFAULT_NAME)
  const [draftName, setDraftName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [inputError, setInputError] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [webPushState, setWebPushState] = useState({ supported: true, subscribed: false, permission: "default" })
  const [isUpdatingWebPush, setIsUpdatingWebPush] = useState(false)
  const [webPushError, setWebPushError] = useState("")

  const loadCurrentUser = useCallback(async () => {
    if (isEditing) return

    const userId = getUserIdFromCookie()
    if (!userId) return

    try {
      const current = await fetchJson(`/api/app/users/${encodeURIComponent(userId)}.json`)
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

    const task = loadCurrentUser()
    registerLoadingTask(task)
  }, [loadCurrentUser, loadOnMount, registerLoadingTask])

  useEffect(() => {
    if (!loadOnMount) return

    const task = getWebPushState()
      .then(setWebPushState)
      .catch(() => {
        setWebPushState({ supported: false, subscribed: false, permission: "unsupported" })
      })
    registerLoadingTask(task)
  }, [loadOnMount, registerLoadingTask])

  const startEditing = () => {
    setDraftName(name)
    setErrorMessage("")
    setInputError("")
    setIsEditing(true)
  }

  const saveName = async () => {
    setInputError("")
    setErrorMessage("")
    const trimmed = draftName.trim()
    if (trimmed.length === 0) {
      setInputError("表示名を入力してください")
      return
    }

    const userId = getUserIdFromCookie()
    if (!userId) {
      setErrorMessage("ユーザーIDが見つかりません")
      return
    }

    setIsSaving(true)
    setErrorMessage("")

    try {
      await postJson("/api/app/users.json", { name: trimmed, userId })
      setName(trimmed)
      setIsEditing(false)
    } catch (_error) {
      setErrorMessage("表示名の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  const updateWebPush = async (operation) => {
    setIsUpdatingWebPush(true)
    setWebPushError("")
    try {
      setWebPushState(await operation())
    } catch (_error) {
      setWebPushError("通知設定の更新に失敗しました")
    } finally {
      setIsUpdatingWebPush(false)
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <NameSection
        name={name}
        draftName={draftName}
        isEditing={isEditing}
        isSaving={isSaving}
        inputError={inputError}
        errorMessage={errorMessage}
        onStartEditing={startEditing}
        onSave={saveName}
        onDraftChange={setDraftName}
      />
      <NotificationsSection
        state={webPushState}
        isSaving={isUpdatingWebPush}
        errorMessage={webPushError}
        onSubscribe={() => updateWebPush(subscribeToWebPush)}
        onUnsubscribe={() => updateWebPush(unsubscribeFromWebPush)}
      />
    </Box>
  )
}

export default function SettingsApp() {
  return (
    <AppsDialogLauncher title="設定" launcherLabel="設定" buttonAriaLabel="設定を開く" buttonIcon={<SettingsIcon />}>
      <SettingsContent loadOnMount />
    </AppsDialogLauncher>
  )
}
