import Typography from "@mui/material/Typography"
import PageContainer from "@/shared/ui/PageContainer"
import { usePageMeta } from "@/shared/hooks/usePageMeta"
import PodcastEpisodesList from "@/features/podcast/ui/PodcastEpisodesList"

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
