import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import Box from "@mui/material/Box"
import { fileName, isImage } from "./mediaData"

export default function MediaPreview({ item }) {
  return isImage(item) ? (
    <Box
      component="img"
      src={item.url}
      alt={item.alt || fileName(item.url)}
      loading="lazy"
      sx={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ) : (
    <Box sx={{ display: "grid", placeItems: "center", width: "100%", height: "100%", bgcolor: "action.hover" }}>
      <InsertDriveFileIcon sx={{ fontSize: { xs: 32, sm: 52 } }} />
    </Box>
  )
}
