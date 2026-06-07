import { useEffect, useState } from "react"

function readInitialQuery() {
  if (typeof window === "undefined") {
    return ""
  }

  return new URLSearchParams(window.location.search).get("q") ?? ""
}

function writeQueryToUrl(query) {
  if (typeof window === "undefined") {
    return
  }

  const url = new URL(window.location.href)
  if (query.trim()) {
    url.searchParams.set("q", query)
  } else {
    url.searchParams.delete("q")
  }

  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
}

export default function useArticleSearchQuery() {
  const [query, setQuery] = useState(readInitialQuery)

  useEffect(() => {
    writeQueryToUrl(query)
  }, [query])

  return [query, setQuery]
}
