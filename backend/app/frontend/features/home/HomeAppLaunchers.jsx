import { lazy, Suspense } from "react"
import Box from "@mui/material/Box"

// const MasudaAimiApp = lazy(() => import("../apps/masudaAimi/MasudaAimiApp"))
const MasudaRunApp = lazy(() => import("../apps/masudaRun/MasudaRunApp"))
const NumbersApp = lazy(() => import("../apps/numbers/NumbersApp"))
const ZukanApp = lazy(() => import("../apps/zukan/ZukanApp"))

function HomeAppLaunchersFallback() {
  return Array.from({ length: 3 }, (_, index) => (
    <Box
      key={index}
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
  ))
}

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Suspense fallback={<HomeAppLaunchersFallback />}>
        <MasudaRunApp />
        {/* <MasudaAimiApp /> */}
        <NumbersApp />
        <ZukanApp />
      </Suspense>
    </Box>
  )
}
