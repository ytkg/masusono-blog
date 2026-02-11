import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import PodcastEpisodesList from "../../features/podcast/PodcastEpisodesList"
import SeoHead from "../../shared/SeoHead"

export default function Podcast({ episodes }) {
  return (
    <>
      <SeoHead
        title="ポッドキャスト"
        description="増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします。"
        canonicalPath="/podcast"
      />

      <PageContainer id="podcast">
        <SectionHeading component="h1">ポッドキャスト</SectionHeading>
        <PodcastEpisodesList episodes={episodes} />
      </PageContainer>
    </>
  )
}
