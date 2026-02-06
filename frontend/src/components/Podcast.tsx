import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PageContainer from "./PageContainer"
import { usePageMeta } from "../hooks/usePageMeta"

const episodes = [
  {
    id: "001",
    title: "プライベートとか普通とかの話",
    audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
  },
] as const

export default function Podcast() {
  usePageMeta({
    title: "ポッドキャスト",
    description: "増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします。",
    canonicalPath: "/podcast",
  })

  return (
    <PageContainer id="podcast">
      <Typography variant="h5" component="h1" gutterBottom>
        ポッドキャスト
      </Typography>
      <Box sx={{ display: "grid", gap: 2 }}>
        {episodes.map((episode) => (
          <Box
            key={episode.id}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: { xs: 2, sm: 2.5 },
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              {episode.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Episode {episode.id}
            </Typography>
            <Box
              component="audio"
              controls
              preload="metadata"
              playsInline
              src={episode.audioUrl}
              aria-label={`エピソード音声: ${episode.title}`}
              sx={{ width: "100%" }}
            >
              お使いのブラウザでは音声再生に対応していません。
            </Box>
          </Box>
        ))}
      </Box>
    </PageContainer>
  )
}
