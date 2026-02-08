import FeatureLinkCard from "@/shared/navigation/FeatureLinkCard"

const featureLinks = [
  { label: "ブログ", description: "最新の記事やお知らせはこちら", to: "/blog" },
  { label: "ポッドキャスト", description: "番組のアーカイブを毎週更新", to: "/podcast" },
  { label: "推し店", description: "おすすめスポットをマップで紹介", to: "/shops" },
]

export default function HomeFeatureLinks() {
  return (
    <>
      {featureLinks.map((item) => (
        <FeatureLinkCard key={item.to} title={item.label} description={item.description} to={item.to} />
      ))}
    </>
  )
}
