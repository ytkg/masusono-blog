import { Navigate, useLocation, useParams, Link as RouterLink } from "react-router-dom"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import PageContainer from "../components/PageContainer"
import PodcastEpisodeCard from "../components/PodcastEpisodeCard"
import type { PodcastEpisode } from "../types/podcast"
import { usePodcast } from "../hooks/usePodcast"
import { usePageMeta } from "../hooks/usePageMeta"

type LocationState = {
  episode?: PodcastEpisode
}

export default function PodcastDetail() {
  const { episodeId } = useParams<{ episodeId: string }>()
  const location = useLocation()
  const state = location.state as LocationState | undefined

  const { data, error, isLoading } = usePodcast(episodeId, state?.episode)
  const episode = data ?? state?.episode ?? null

  usePageMeta({
    title: episode?.title ?? "ポッドキャスト",
    description: episode
      ? `増田とその他！のポッドキャストエピソード「${episode.title}」を再生できます。`
      : "増田とその他！のポッドキャストエピソード詳細ページです。",
    canonicalPath: episodeId ? `/podcast/${episodeId}` : undefined,
  })

  if (!episodeId) {
    return <Navigate to="/podcast" replace />
  }

  return (
    <PageContainer component="article">
      <Typography variant="h5" component="h2" gutterBottom>
        ポッドキャスト
      </Typography>
      <PodcastEpisodeCard episode={episode ?? undefined} mode="detail" loading={isLoading} error={error} />
      <Link
        component={RouterLink}
        to="/podcast"
        color="inherit"
        underline="hover"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 3 }}
      >
        <ArrowBackIcon fontSize="small" />
        エピソード一覧に戻る
      </Link>
    </PageContainer>
  )
}
