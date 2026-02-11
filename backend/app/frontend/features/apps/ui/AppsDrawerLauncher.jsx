import { useId, useState } from "react"
import AppsIcon from "@mui/icons-material/Apps"
import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"

export default function AppsDrawerLauncher({
  title,
  launcherLabel,
  buttonAriaLabel,
  children,
  onOpen,
  buttonSx,
  buttonIcon,
  paperSx,
}) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const iconBaseSx = {
    borderRadius: 2,
    width: 56,
    height: 56,
    bgcolor: "common.black",
    color: "common.white",
    "&:hover": {
      bgcolor: "common.black",
    },
  }
  const iconSx = buttonSx ? [iconBaseSx, buttonSx] : iconBaseSx
  const closeButtonSx = {
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    borderRadius: 1,
    px: 1.5,
    py: 1,
    "&:hover": {
      bgcolor: "background.paper",
    },
  }
  const paperBaseSx = {
    height: "100dvh",
    width: "100%",
    borderRadius: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }
  const paperCombinedSx = paperSx ? [paperBaseSx, paperSx] : paperBaseSx
  const launcherLabelText = launcherLabel ?? title

  const handleOpen = () => {
    onOpen?.()
    setOpen(true)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
        <IconButton aria-label={buttonAriaLabel} onClick={handleOpen} sx={iconSx}>
          {buttonIcon ?? <AppsIcon />}
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", width: "100%" }}>
          {launcherLabelText}
        </Typography>
      </Box>
      <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)} aria-labelledby={titleId} PaperProps={{ sx: paperCombinedSx }}>
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography id={titleId} variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>{open ? children : null}</Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton aria-label="閉じる" onClick={() => setOpen(false)} sx={closeButtonSx}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}
