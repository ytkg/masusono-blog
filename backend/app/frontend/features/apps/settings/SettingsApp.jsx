import SettingsSection from "./SettingsSection"
import useDisplayName from "./useDisplayName"
import useWebPushSettings from "./useWebPushSettings"
import { supportingTextSx } from "@/shared/typographyStyles"
import StatusAlert from "@/shared/components/StatusAlert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import SettingsIcon from "@mui/icons-material/Settings"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import { useAppLoading } from "../shared/AppsLoadingContext"

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
    <SettingsSection label="表示名">
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
            <Button variant="contained" size="small" onClick={onSave} disabled={isSaving} sx={{ height: fieldHeight }}>
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
    </SettingsSection>
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
    <SettingsSection label="新着記事の通知">
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
    </SettingsSection>
  )
}

export function SettingsContent({ loadOnMount = false }) {
  const registerLoadingTask = useAppLoading()
  const { name, draftName, isEditing, isSaving, inputError, errorMessage, startEditing, saveName, setDraftName } =
    useDisplayName({ loadOnMount, registerLoadingTask })
  const notifications = useWebPushSettings({ loadOnMount, registerLoadingTask })

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
        state={notifications.state}
        isSaving={notifications.isSaving}
        errorMessage={notifications.errorMessage}
        onSubscribe={notifications.subscribe}
        onUnsubscribe={notifications.unsubscribe}
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
