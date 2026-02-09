import SectionHeading from "@/shared/ui/SectionHeading"
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
      <SectionHeading component="h1">ポッドキャスト</SectionHeading>
      <PodcastEpisodesList />
    </PageContainer>
  )
}
