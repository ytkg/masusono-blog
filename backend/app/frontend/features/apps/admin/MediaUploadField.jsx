import { useRef, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { requestJson } from "../../../shared/lib/fetchJson"

const uploadUrl = "/api/app/management/media"
const maxFileSize = 5 * 1024 * 1024

export default function MediaUploadField({ csrfToken, onUnauthorized, onUploaded }) {
  const [uploadError, setUploadError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  async function uploadFile(file) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("画像ファイルを選択してください。")
      fileInputRef.current.value = ""
      return
    }
    if (file.size > maxFileSize) {
      setUploadError("画像ファイルは5MB以下にしてください。")
      fileInputRef.current.value = ""
      return
    }

    setUploading(true)
    setUploadError(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      await requestJson(uploadUrl, {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-Token": csrfToken },
        body: formData,
      })
      onUploaded()
    } catch (failure) {
      if (failure.status === 401) {
        onUnauthorized()
      } else {
        setUploadError(failure.message || "画像をアップロードできませんでした。時間をおいて再度お試しください。")
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

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
      {uploadError ? (
        <Typography role="alert" color="error" sx={{ mt: 1 }}>
          {uploadError}
        </Typography>
      ) : null}
    </Box>
  )
}
