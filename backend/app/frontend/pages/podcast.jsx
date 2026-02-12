import Typography from "@mui/material/Typography"
import PageContainer from "../shared/PageContainer"
import SectionHeading from "../shared/SectionHeading"
import PodcastEpisodesList from "../features/podcast/PodcastEpisodesList"
import useEpisodes from "../features/podcast/hooks/useEpisodes"
import SeoHead from "../shared/SeoHead"

export default function Podcast() {
  const { episodes, error, isLoading } = useEpisodes()

  return (
    <>
      <SeoHead
        title="ポッドキャスト"
        description="増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします。"
        canonicalPath="/podcast"
      />

      <PageContainer id="podcast">
        <SectionHeading component="h1">ポッドキャスト</SectionHeading>
        {isLoading ? (
          <Typography color="text.secondary">エピソードを読み込み中です。</Typography>
        ) : error ? (
          <Typography color="error.main">エピソードの取得に失敗しました。時間を置いて再度お試しください。</Typography>
        ) : (
          <PodcastEpisodesList episodes={episodes} />
        )}
      </PageContainer>
    </>
  )
}
