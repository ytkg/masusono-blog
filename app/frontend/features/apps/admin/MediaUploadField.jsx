import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import StatusAlert from "../../../shared/components/StatusAlert"
import LoadingStatus from "../../../shared/components/LoadingStatus"
import useMediaUpload from "./useMediaUpload"

export default function MediaUploadField({ csrfToken, onUnauthorized, onUploaded }) {
  const { uploadError, uploading, fileInputRef, uploadFile } = useMediaUpload({ csrfToken, onUnauthorized, onUploaded })

  return (
    <Box sx={{ mb: { xs: 1, sm: 2 } }}>
      <Button component="label" variant="contained" disabled={uploading}>
        {uploading ? "アップロード中…" : "アップロード"}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={uploading}
          onChange={(event) => uploadFile(event.target.files?.[0])}
        />
      </Button>
      {uploading ? <LoadingStatus>アップロード中…</LoadingStatus> : null}
      {uploadError ? <StatusAlert sx={{ mt: 1 }}>{uploadError}</StatusAlert> : null}
    </Box>
  )
}
