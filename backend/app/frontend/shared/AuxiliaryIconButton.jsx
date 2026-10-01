import { focusRingSx } from "./focusStyles"
import IconButton from "@mui/material/IconButton"

const auxiliaryIconButtonSx = {
  width: 44,
  height: 44,
  flexShrink: 0,
  color: "text.secondary",
  opacity: 1,
  "& .MuiSvgIcon-root": { fontSize: 20 },
  "&:hover": { bgcolor: "#f5f5f5" },
  "&.Mui-focusVisible": focusRingSx,
  "&.Mui-disabled": { color: "text.disabled" },
}

export default function AuxiliaryIconButton(props) {
  return <IconButton {...props} sx={auxiliaryIconButtonSx} />
}
