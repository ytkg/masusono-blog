import CloseIcon from "@mui/icons-material/Close"
import AuxiliaryIconButton from "../../../shared/AuxiliaryIconButton"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Typography from "@mui/material/Typography"
import MediaPreview from "./MediaPreview"
import { fileName, isImage } from "./mediaData"

export default function MediaDetailDialog({ selected, onClose }) {
  return (
    <Dialog open={Boolean(selected)} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="media-detail-title">
      {selected ? (
        <>
          <DialogTitle id="media-detail-title" sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box component="span" sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
              {fileName(selected.url)}
            </Box>
            <AuxiliaryIconButton aria-label="メディア詳細を閉じる" onClick={onClose}>
              <CloseIcon />
            </AuxiliaryIconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ height: "min(60vh, 560px)", mb: 2 }}>
              <MediaPreview item={selected} />
            </Box>
            {isImage(selected) ? (
              <Typography>
                画像サイズ: {selected.width} × {selected.height} px
              </Typography>
            ) : null}
            {selected.alt ? <Typography>代替テキスト: {selected.alt}</Typography> : null}
            {selected.createdAt ? (
              <Typography>登録日時: {new Date(selected.createdAt).toLocaleString("ja-JP")}</Typography>
            ) : null}
            {selected.tags?.length ? <Typography>タグ: {selected.tags.join("、")}</Typography> : null}
          </DialogContent>
        </>
      ) : null}
    </Dialog>
  )
}
