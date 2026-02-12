import { Link } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import PodcastEpisodeCard from "../features/podcast/PodcastEpisodeCard"
import useEpisode from "../features/podcast/hooks/useEpisode"
import useCurrentPathSegmentId from "../shared/hooks/useCurrentPathSegmentId"
import SeoHead from "../shared/SeoHead"

export default function PodcastDetail() {
  const episodeId = useCurrentPathSegmentId()
  const { episode, error, isLoading } = useEpisode(episodeId)

  const canonical = episode?.id ? `/podcast/${episode.id}` : "/podcast"
  const description = episode
    ? `増田とその他！のポッドキャストエピソード「${episode.title}」を再生できます。`
    : "増田とその他！のポッドキャストエピソード詳細ページです。"

  return (
    <>
      <SeoHead title={episode?.title ?? "ポッドキャスト"} description={description} canonicalPath={canonical} />

      <PageContainer component="article">
        <SectionHeading component="h2">ポッドキャスト</SectionHeading>
        {isLoading ? (
          <Typography color="text.secondary">エピソードを読み込み中です。</Typography>
        ) : error ? (
          <Typography color="error.main">エピソードの取得に失敗しました。時間を置いて再度お試しください。</Typography>
        ) : (
          <PodcastEpisodeCard episode={episode ?? undefined} mode="detail" />
        )}
        <MuiLink
          component={Link}
          href="/podcast"
          prefetch
          color="inherit"
          underline="hover"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 3 }}
        >
          <ArrowBackIcon fontSize="small" />
          エピソード一覧に戻る
        </MuiLink>
      </PageContainer>
    </>
  )
}
