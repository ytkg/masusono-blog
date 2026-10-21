import { useId, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"

export default function ReceiptDialog({ round, children }) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const close = () => setOpen(false)
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)} sx={{ my: 2 }}>
        レシートを見る
      </Button>
      <Dialog open={open} onClose={close} aria-labelledby={titleId} fullWidth maxWidth="sm">
        <DialogTitle
          id={`${titleId}-heading`}
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
        >
          <span id={titleId}>ラウンド{round}のレシート</span>
          <IconButton aria-label="レシートを閉じる" onClick={close} autoFocus>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f2eee7", color: "#30273f" }}>
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}
