import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import UechanBirthdaySection from "./UechanBirthdaySection"
import { usePageMeta } from "@/shared/hooks/usePageMeta"
import HomeHero from "./HomeHero"
import HomeAppLaunchers from "./HomeAppLaunchers"
import HomeFeatureLinks from "./HomeFeatureLinks"
import { ensureUserIdCookie } from "@/utils/userId"

export default function HomePage() {
  const [now, setNow] = useState(() => new Date())
  usePageMeta({ canonicalPath: "/" })
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  const formatted = now.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, display: "flex", flexDirection: "column", gap: { xs: 3, sm: 4 } }}>
      <HomeHero formattedNow={formatted} />

      <Stack spacing={1.75}>
        <UechanBirthdaySection now={now} />
        <HomeAppLaunchers />
        <HomeFeatureLinks />
      </Stack>
    </Box>
  )
}
