import { usePageMeta } from "@/shared/hooks/usePageMeta"
import { ShopsPageContainer } from "@/features/shops/ui/ShopsPageContainer"

export default function ShopsPage() {
  usePageMeta({
    title: "推し店",
    description: "増田とその他！おすすめのスポットをマップ付きで紹介。カテゴリー別に推し店を探せます。",
    canonicalPath: "/shops",
  })

  return <ShopsPageContainer />
}
