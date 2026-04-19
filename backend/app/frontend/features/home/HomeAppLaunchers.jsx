import { lazy, Suspense } from "react"
import Box from "@mui/material/Box"

const MasudaRunApp = lazy(() => import("../apps/masudaRun/MasudaRunApp"))
const NumbersApp = lazy(() => import("../apps/numbers/NumbersApp"))
const SettingsApp = lazy(() => import("../apps/settings/SettingsApp"))
const ZukanApp = lazy(() => import("../apps/zukan/ZukanApp"))

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Suspense fallback={null}>
        <MasudaRunApp />
        <NumbersApp />
        <ZukanApp />
        <SettingsApp />
      </Suspense>
    </Box>
  )
}
