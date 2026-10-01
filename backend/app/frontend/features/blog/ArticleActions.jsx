import { useState } from "react"
import AuxiliaryIconButton from "../../shared/AuxiliaryIconButton"
import Button from "@mui/material/Button"
import StatusAlert from "@/shared/components/StatusAlert"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Snackbar from "@mui/material/Snackbar"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { buildArticleCopyText } from "./articleCopyText"

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

  const handleCopy = async (kind = "url") => {
    const label = kind === "full" ? "記事全文" : "記事URL"
    handleClose()

    try {
      await navigator.clipboard.writeText(kind === "full" ? buildArticleCopyText(article) : buildArticleUrl(article.id))
      setFeedback({ severity: "success", kind, message: `${label}をコピーしました` })
    } catch {
      setFeedback({ severity: "error", kind, message: `${label}をコピーできませんでした` })
    }
  }

  return (
    <>
      <AuxiliaryIconButton
        aria-label="記事メニューを開く"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={handleOpen}
      >
        <MoreHorizIcon fontSize="small" />
      </AuxiliaryIconButton>
      <Menu anchorEl={anchorEl} open={isOpen} onClose={handleClose}>
        <MenuItem onClick={() => handleCopy("url")}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          記事URLをコピー
        </MenuItem>
        <MenuItem onClick={() => handleCopy("full")}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          記事全文をコピー
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
                <Button color="inherit" size="small" onClick={() => handleCopy(feedback.kind)}>
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
