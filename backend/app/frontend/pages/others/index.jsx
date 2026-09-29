import { lazy, Suspense } from "react"
import Box from "@mui/material/Box"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import Typography from "@mui/material/Typography"
import { Link } from "@inertiajs/react"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import SeoHead from "../../shared/SeoHead"

const MasudaRunApp = lazy(() => import("../../features/apps/masudaRun/MasudaRunApp"))
const SettingsApp = lazy(() => import("../../features/apps/settings/SettingsApp"))

function OthersAppFallback() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        width: 56,
      }}
    >
      <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: "action.hover" }} />
      <Box sx={{ width: 36, height: 12, borderRadius: 1, bgcolor: "action.hover" }} />
    </Box>
  )
}

export default function OthersIndex() {
  return (
    <>
      <SeoHead
        title="増田とその他のその他！"
        description="増田とその他！のミニアプリをまとめたページです。"
        canonicalPath="/others"
      />

      <PageContainer id="others">
        <SectionHeading component="h1">増田とその他のその他！</SectionHeading>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Suspense fallback={<OthersAppFallback />}>
            <MasudaRunApp />
            <SettingsApp />
          </Suspense>
          <Box
            component={Link}
            href="/admin"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "common.black",
                color: "common.white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AdminPanelSettingsIcon />
            </Box>
            <Typography variant="caption" color="text.secondary">
              管理
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}
