import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

interface HomeHeroProps {
  formattedNow: string
}

export default function HomeHero({ formattedNow }: HomeHeroProps) {
  return (
    <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        ようこそ
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formattedNow}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        ブログやポッドキャスト、ちょっとしたゲームまで。最新のコンテンツをまとめてチェックできます。
      </Typography>
    </Box>
  )
}
