import { useEffect } from "react"
import { trackPageView } from "./lib/analytics"
import { Head } from "@inertiajs/react"

const SITE_TITLE = "増田とその他！"
const SITE_URL = "https://masusono.com"
const DEFAULT_DESCRIPTION =
  "増田とその他！の公式サイト。ブログやミニゲームなど増田周辺の最新コンテンツをまとめてチェックできます。"

function toAbsoluteUrl(path) {
  const normalizedPath = path?.startsWith("/") ? path : `/${path ?? ""}`
  return `${SITE_URL}${normalizedPath}`
}

export default function SeoHead({ title, description, canonicalPath = "/", imagePath, imageAlt }) {
  const fullTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const canonicalUrl = toAbsoluteUrl(canonicalPath)

  useEffect(() => {
    trackPageView(fullTitle)
  })

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      {imagePath && [
        <meta key="og:image" property="og:image" content={toAbsoluteUrl(imagePath)} />,
        <meta key="og:image:secure_url" property="og:image:secure_url" content={toAbsoluteUrl(imagePath)} />,
        <meta key="og:image:type" property="og:image:type" content="image/png" />,
        <meta key="og:image:width" property="og:image:width" content="1200" />,
        <meta key="og:image:height" property="og:image:height" content="630" />,
        <meta key="og:image:alt" property="og:image:alt" content={imageAlt} />,
        <meta key="twitter:image" name="twitter:image" content={toAbsoluteUrl(imagePath)} />,
        <meta key="twitter:image:alt" name="twitter:image:alt" content={imageAlt} />,
      ]}
      <meta name="twitter:card" content={imagePath ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
    </Head>
  )
}
