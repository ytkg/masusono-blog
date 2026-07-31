import { useId, useState } from "react"
import AppsIcon from "@mui/icons-material/Apps"
import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import Fade from "@mui/material/Fade"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"

const launcherContainerSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1,
}

const launcherSx = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0.5,
}

const iconButtonBaseSx = {
  borderRadius: 2,
  width: 56,
  height: 56,
  bgcolor: "common.black",
  color: "common.white",
  "&:hover": { bgcolor: "common.black" },
}

const dialogPaperBaseSx = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}

const dialogContentSx = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 3,
  p: { xs: 2, sm: 3 },
}

const dialogHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  flexWrap: "wrap",
}

const closeButtonSx = {
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  borderRadius: 1,
  px: 1.5,
  py: 1,
  "&:hover": { bgcolor: "background.paper" },
}

export default function AppsDialogLauncher({
  title,
  launcherLabel,
  buttonAriaLabel,
  children,
  onOpen,
  onClose,
  buttonSx,
  buttonIcon,
  paperSx,
  showLauncherLabel = true,
  titleAccessory,
}) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const launcherLabelText = launcherLabel ?? title
  const iconButtonSx = buttonSx ? [iconButtonBaseSx, buttonSx] : iconButtonBaseSx
  const dialogPaperSx = paperSx ? [dialogPaperBaseSx, paperSx] : dialogPaperBaseSx

  const handleOpen = () => {
    onOpen?.()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  return (
    <Box sx={launcherContainerSx}>
      <Box sx={launcherSx}>
        <IconButton aria-label={buttonAriaLabel} onClick={handleOpen} sx={iconButtonSx}>
          {buttonIcon ?? <AppsIcon />}
        </IconButton>
        {showLauncherLabel ? (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", width: "100%" }}>
            {launcherLabelText}
          </Typography>
        ) : null}
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby={titleId}
        fullScreen
        scroll="paper"
        slots={{ transition: Fade }}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <Box sx={dialogContentSx}>
          <Box sx={dialogHeaderSx}>
            <Typography id={titleId} variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {titleAccessory ? <Box sx={{ ml: "auto" }}>{titleAccessory}</Box> : null}
            <IconButton aria-label="閉じる" onClick={handleClose} sx={closeButtonSx}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>{open ? children : null}</Box>
        </Box>
      </Dialog>
    </Box>
  )
}
