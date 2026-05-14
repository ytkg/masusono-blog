import { useEffect } from "react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import HomeHero from "../features/home/HomeHero"
import HomeFeatureLinks from "../features/home/HomeFeatureLinks"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import SeoHead from "../shared/SeoHead"

export default function Home() {
  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  return (
    <>
      <SeoHead title="ホーム" canonicalPath="/" />
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, display: "flex", flexDirection: "column", gap: { xs: 3, sm: 4 } }}>
        <HomeHero />
        <Stack spacing={1.75}>
          <HomeFeatureLinks />
        </Stack>
      </Box>
    </>
  )
}
