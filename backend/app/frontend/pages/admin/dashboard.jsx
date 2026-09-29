import { Link } from "@inertiajs/react"
import CollectionsIcon from "@mui/icons-material/Collections"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"

export default function AdminDashboard() {
  return (
    <>
      <SeoHead title="管理画面" description="管理ダッシュボード" canonicalPath="/admin" />
      <PageContainer id="admin-dashboard">
        <Typography component="h1" variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          管理画面
        </Typography>
        <Box
          component={Link}
          href="/admin/media"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            color: "inherit",
            textDecoration: "none",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CollectionsIcon />
          <Typography fontWeight={600}>メディア一覧へ</Typography>
        </Box>
      </PageContainer>
    </>
  )
}
