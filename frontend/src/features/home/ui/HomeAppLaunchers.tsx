import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"
import { lazy, Suspense } from "react"

const MasudaRunApp = lazy(() => import("@/features/apps/masudaRun/MasudaRunApp"))
const NumbersApp = lazy(() => import("@/features/apps/numbers/NumbersApp"))

function AppLauncherFallback() {
  return <Skeleton variant="rounded" width={176} height={40} animation="wave" />
}

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Suspense fallback={<AppLauncherFallback />}>
        <MasudaRunApp />
      </Suspense>
      <Suspense fallback={<AppLauncherFallback />}>
        <NumbersApp />
      </Suspense>
    </Box>
  )
}
