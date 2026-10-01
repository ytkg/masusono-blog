import { useState } from "react"
import AuxiliaryIconButton from "../../shared/AuxiliaryIconButton"
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
  const [message, setMessage] = useState("")
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
      setMessage("記事URLをコピーしました")
    } catch {
      setMessage("記事URLをコピーできませんでした")
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
        <MenuItem onClick={handleCopy}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          記事URLをコピー
        </MenuItem>
      </Menu>
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2400}
        message={message}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  )
}
