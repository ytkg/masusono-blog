import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import HomeHero from "../features/home/HomeHero"
import HomeFeatureLinks from "../features/home/HomeFeatureLinks"
import HomeAppLaunchers from "../features/home/HomeAppLaunchers"
import { ensureUserIdCookie } from "../utils/userId"
import SeoHead from "../shared/SeoHead"

export default function Home() {
  const [now, setNow] = useState(() => new Date())

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
    timeZone: "Asia/Tokyo",
  })

  return (
    <>
      <SeoHead title="ホーム" canonicalPath="/" />
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, display: "flex", flexDirection: "column", gap: { xs: 3, sm: 4 } }}>
        <HomeHero formattedNow={formatted} />
        <Stack spacing={1.75}>
          <HomeAppLaunchers />
          <HomeFeatureLinks />
        </Stack>
      </Box>
    </>
  )
}
