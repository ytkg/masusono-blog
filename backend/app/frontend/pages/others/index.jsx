import { lazy, Suspense } from "react"
import Box from "@mui/material/Box"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import AppsDialogLauncher from "../../features/apps/shared/AppsDialogLauncher"
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
          <AppsDialogLauncher
            title="管理"
            buttonAriaLabel="管理を開く"
            buttonIcon={<AdminPanelSettingsIcon />}
            navigationHref="/admin"
          />
        </Box>
      </PageContainer>
    </>
  )
}
