import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"

const labels = { success: "完了", warning: "注意", error: "失敗" }

export default function StatusAlert({ severity = "error", children, ...props }) {
  return (
    <Alert severity={severity} {...props}>
      <Box component="span" sx={{ fontWeight: 700 }}>
        {labels[severity]}：
      </Box>
      {children}
    </Alert>
  )
}
