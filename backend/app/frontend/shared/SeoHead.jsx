import { Head } from "@inertiajs/react"

const SITE_TITLE = "増田とその他！"
const SITE_URL = "https://masusono.com"
const DEFAULT_DESCRIPTION =
  "増田とその他！の公式サイト。ブログやミニゲームなど増田周辺の最新コンテンツをまとめてチェックできます。"

function toAbsoluteUrl(path) {
  const normalizedPath = path?.startsWith("/") ? path : `/${path ?? ""}`
  return `${SITE_URL}${normalizedPath}`
}

export default function SeoHead({ title, description, canonicalPath = "/" }) {
  const fullTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const canonicalUrl = toAbsoluteUrl(canonicalPath)

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
    </Head>
  )
}
