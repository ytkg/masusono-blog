import { useState } from "react"
import Button from "@mui/material/Button"
import StatusAlert from "@/shared/components/StatusAlert"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Snackbar from "@mui/material/Snackbar"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"

function buildArticleUrl(articleId) {
  const path = `/articles/${articleId}`
  const origin = typeof window === "undefined" ? "" : window.location.origin

  return `${origin}${path}`
}

export default function ArticleActions({ article }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const isOpen = Boolean(anchorEl)

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCopy = async () => {
    handleClose()

    try {
      await navigator.clipboard.writeText(buildArticleUrl(article.id))
      setFeedback({ severity: "success", message: "記事URLをコピーしました" })
    } catch {
      setFeedback({ severity: "error", message: "記事URLをコピーできませんでした" })
    }
  }

  return (
    <>
      <IconButton
        aria-label="記事メニューを開く"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleOpen}
        size="small"
        sx={{
          color: "text.secondary",
          opacity: 0.72,
          p: 0.5,
          "&:hover": { opacity: 1 },
        }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
        <MenuItem onClick={handleCopy}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          記事URLをコピー
        </MenuItem>
      </Menu>
      <Snackbar
        key={feedback?.severity}
        open={Boolean(feedback)}
        autoHideDuration={feedback?.severity === "success" ? 3000 : null}
        onClose={(_event, reason) => {
          if (reason !== "clickaway" && feedback?.severity === "success") setFeedback(null)
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <StatusAlert
          severity={feedback?.severity || "success"}
          onClose={() => setFeedback(null)}
          action={
            feedback?.severity === "error" ? (
              <>
                <Button color="inherit" size="small" onClick={handleCopy}>
                  再試行
                </Button>
                <Button color="inherit" size="small" onClick={() => setFeedback(null)}>
                  閉じる
                </Button>
              </>
            ) : undefined
          }
          sx={{ width: "100%", minWidth: 0, "& .MuiAlert-message": { overflowWrap: "anywhere" } }}
        >
          {feedback?.message}
        </StatusAlert>
      </Snackbar>
    </>
  )
}
