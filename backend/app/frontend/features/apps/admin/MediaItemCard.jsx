import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import MediaPreview from "./MediaPreview"
import { fileName } from "./mediaData"

export default function MediaItemCard({ item, onSelect }) {
  const name = fileName(item.url)

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(item)}
      aria-label={`${name}の詳細を表示`}
      sx={{
        minWidth: 0,
        width: "100%",
        p: 0,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 1, sm: 2 },
        overflow: "hidden",
        bgcolor: "background.paper",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <Box sx={{ aspectRatio: { xs: "1", sm: "auto" }, height: { xs: "auto", sm: 140 } }}>
        <MediaPreview item={item} />
      </Box>
      <Typography
        variant="caption"
        component="span"
        sx={{
          display: "block",
          p: { xs: 0.5, sm: 1 },
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Typography>
    </Box>
  )
}
