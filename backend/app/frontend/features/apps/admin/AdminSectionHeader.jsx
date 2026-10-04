import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function AdminSectionHeader({ title, onBack, backLabel = "管理画面" }) {
  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={onBack}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: "inherit",
          mb: { xs: 1, sm: 2 },
          p: 0,
          border: 0,
          bgcolor: "transparent",
          cursor: "pointer",
        }}
      >
        <ArrowBackIcon fontSize="small" />
        {backLabel}
      </Box>
      <Typography component="h3" variant="h6" fontWeight={700} sx={{ mb: { xs: 1, sm: 2 } }}>
        {title}
      </Typography>
    </>
  )
}
