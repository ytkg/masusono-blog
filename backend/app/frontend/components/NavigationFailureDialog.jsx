import { useSyncExternalStore } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import {
  dismissNavigationFailure,
  getNavigationFailure,
  subscribeNavigationFailure,
} from "../shared/lib/navigationRecovery"

export default function NavigationFailureDialog() {
  const failure = useSyncExternalStore(subscribeNavigationFailure, getNavigationFailure, () => null)
  return (
    <Dialog
      open={Boolean(failure)}
      onClose={dismissNavigationFailure}
      aria-labelledby="navigation-failure-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="navigation-failure-title">読み込みに失敗しました</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {failure?.kind === "network_error"
            ? "通信が途切れた可能性があります。接続を確認して、もう一度お試しください。"
            : "ページの読み込みに失敗しました。少し待ってから、もう一度お試しください。"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={dismissNavigationFailure} color="inherit" sx={{ minHeight: 44 }}>
          閉じる
        </Button>
        <Button component="a" href={failure?.url} variant="contained" color="primary" sx={{ minHeight: 44 }}>
          再読み込み
        </Button>
      </DialogActions>
    </Dialog>
  )
}
