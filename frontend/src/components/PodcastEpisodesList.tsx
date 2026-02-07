import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"
import Alert from "@mui/material/Alert"
import { usePodcasts } from "../hooks/usePodcasts"

const SKELETON_COUNT = 3
const SKELETON_KEYS = Array.from({ length: SKELETON_COUNT }, (_, index) => `podcast-skeleton-${index}`)

export default function PodcastEpisodesList() {
  const { data: episodes, isLoading, error } = usePodcasts()

  if (isLoading && !episodes) {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        {SKELETON_KEYS.map((key) => (
          <Card key={key}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    )
  }

  if (error && !episodes) {
    return <Alert severity="error">エピソードの取得に失敗しました: {String((error as Error)?.message ?? error)}</Alert>
  }

  if (!episodes?.length) {
    return <Typography color="text.secondary">エピソードがありません。</Typography>
  }

  return (
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
            {`${episode.publishedAt} Episode ${episode.id}`}
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
  )
}
