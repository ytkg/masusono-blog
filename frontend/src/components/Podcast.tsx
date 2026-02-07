import Typography from "@mui/material/Typography"
import PageContainer from "./PageContainer"
import { usePageMeta } from "../hooks/usePageMeta"
import PodcastEpisodesList from "./PodcastEpisodesList"

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
      <PodcastEpisodesList />
    </PageContainer>
  )
}
