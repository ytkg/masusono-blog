import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import FeatureLinkCard from "@/shared/navigation/FeatureLinkCard"
import UechanBirthdaySection from "@/components/UechanBirthdaySection"
import { usePageMeta } from "@/hooks/usePageMeta"
import MasudaRunApp from "@/features/apps/masudaRun/MasudaRunApp"
import NumbersApp from "@/features/apps/numbers/NumbersApp"

const featureLinks = [
  { label: "ブログ", description: "最新の記事やお知らせはこちら", to: "/blog" },
  { label: "ポッドキャスト", description: "番組のアーカイブを毎週更新", to: "/podcast" },
  { label: "推し店", description: "おすすめスポットをマップで紹介", to: "/shops" },
]

export default function Home() {
  const [now, setNow] = useState(() => new Date())
  usePageMeta({ canonicalPath: "/" })
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
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
  const appLaunchers = [<MasudaRunApp key="masuda-run" />, <NumbersApp key="numbers-app" />]
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, display: "flex", flexDirection: "column", gap: { xs: 3, sm: 4 } }}>
      <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          ようこそ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {formatted}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ブログやポッドキャスト、ちょっとしたゲームまで。最新のコンテンツをまとめてチェックできます。
        </Typography>
      </Box>

      <Stack spacing={1.75}>
        <UechanBirthdaySection now={now} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{appLaunchers}</Box>
        {featureLinks.map((item) => (
          <FeatureLinkCard key={item.to} title={item.label} description={item.description} to={item.to} />
        ))}
      </Stack>
    </Box>
  )
}
