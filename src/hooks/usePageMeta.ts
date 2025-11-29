import { useEffect } from "react"

const SITE_TITLE = "増田とその他！"
const DEFAULT_DESCRIPTION =
  "増田とその他！の公式サイト。ブログやポッドキャスト、ミニゲームなど増田周辺の最新コンテンツをまとめてチェックできます。"

type PageMetaOptions = {
  title?: string
  description?: string
  canonicalPath?: string
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  if (typeof document === "undefined") return
  const head = document.head || document.getElementsByTagName("head")[0]
  if (!head) return

  let element = head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)
  if (!element) {
    if (selector.startsWith("meta[")) {
      element = document.createElement("meta")
    } else if (selector.startsWith("link[")) {
      element = document.createElement("link")
    }
    if (!element) return
    head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

export function usePageMeta({ title, description, canonicalPath }: PageMetaOptions = {}) {
  useEffect(() => {
    if (typeof document === "undefined") return

    const fullTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE
    document.title = fullTitle

    const desc = description ?? DEFAULT_DESCRIPTION
    upsertMeta('meta[name="description"]', { name: "description", content: desc })
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle })
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: desc })
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle })
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: desc })

    if (canonicalPath) {
      const url = new URL(canonicalPath, window.location.origin).toString()
      upsertMeta('link[rel="canonical"]', { rel: "canonical", href: url })
      upsertMeta('meta[property="og:url"]', { property: "og:url", content: url })
    }
  }, [title, description, canonicalPath])
}
