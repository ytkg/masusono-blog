import { Link } from "@inertiajs/react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MuiLink from "@mui/material/Link"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import PodcastEpisodeCard from "../../features/podcast/PodcastEpisodeCard"
import SeoHead from "../../shared/SeoHead"

export default function PodcastDetail({ episode = null }) {
  const canonical = episode?.id ? `/podcast/${episode.id}` : "/podcast"
  const description = episode
    ? `増田とその他！のポッドキャストエピソード「${episode.title}」を再生できます。`
    : "増田とその他！のポッドキャストエピソード詳細ページです。"

  return (
    <>
      <SeoHead title={episode?.title ?? "ポッドキャスト"} description={description} canonicalPath={canonical} />

      <PageContainer component="article">
        <SectionHeading component="h2">ポッドキャスト</SectionHeading>
        <PodcastEpisodeCard episode={episode ?? undefined} mode="detail" />
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
