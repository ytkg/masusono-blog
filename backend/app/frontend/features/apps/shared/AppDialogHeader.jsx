import { titleTextSx } from "@/shared/typographyStyles"
import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import AuxiliaryIconButton from "../../../shared/AuxiliaryIconButton"

const dialogHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
  minHeight: 44,
  pb: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
}

export default function AppDialogHeader({ title, titleId, accessory, onClose }) {
  return (
    <Box sx={dialogHeaderSx}>
      <Typography id={titleId} variant="h5" component="h2" sx={titleTextSx}>
        {title}
      </Typography>
      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
        {accessory}
        <AuxiliaryIconButton aria-label="閉じる" onClick={onClose} autoFocus>
          <CloseIcon />
        </AuxiliaryIconButton>
      </Box>
    </Box>
  )
}
