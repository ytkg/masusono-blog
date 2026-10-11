import Typography from "@mui/material/Typography"
import { supportingTextSx } from "../styles/typographyStyles"

export default function EmptyStatus({ children }) {
  return <Typography sx={supportingTextSx}>{children}</Typography>
}
